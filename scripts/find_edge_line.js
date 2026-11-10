const { spawn } = require('child_process');
const http = require('http');

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

console.log("Finding exact object causing edge line...");
const proc = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9272',
  '--user-data-dir=C:\\Users\\artin\\AppData\\Local\\Temp\\edge_debug_9272',
  '--no-sandbox',
  '--window-size=1280,800',
  'file:///C:/Users/artin/Documents/world%20lang/index.html'
]);

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  await wait(2500);

  http.get('http://127.0.0.1:9272/json', (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      const tabs = JSON.parse(d);
      const page = tabs.find(t => t.url.includes('world') || t.url.includes('index.html'));
      const ws = new WebSocket(page.webSocketDebuggerUrl);

      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
      };

      ws.onmessage = async (e) => {
        const msg = JSON.parse(e.data);
        if (msg.id === 1) {
          ws.send(JSON.stringify({
            id: 2,
            method: 'Runtime.evaluate',
            params: {
              expression: `(() => {
                const scene = window._appState.globe.scene();
                const items = [];
                let idx = 0;
                scene.traverse(o => {
                  if (o.geometry) {
                    items.push({
                      id: idx++,
                      type: o.type,
                      parentType: o.parent?.type,
                      globeType: o.__globeObjType || o.parent?.__globeObjType,
                      geo: o.geometry.type,
                      vertCount: o.geometry.attributes?.position?.count,
                      color: o.material?.color ? '#' + o.material.color.getHexString() : 'none',
                      wireframe: o.material?.wireframe
                    });
                  }
                });
                return items.filter(x => x.geo.includes('Sphere') || x.geo.includes('Line') || x.color === '#ffffaa' || x.color.includes('d3') || x.color.includes('ff'));
              })()`,
              returnByValue: true
            }
          }));
        } else if (msg.id === 2) {
          console.log('Candidate objects:', JSON.stringify(msg.result.result.value, null, 2));
          ws.close();
          proc.kill();
          process.exit(0);
        }
      };
    });
  });
}

run();

