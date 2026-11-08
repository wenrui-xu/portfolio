import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {buildContent} from './scripts/build-content.mjs';

function contentFiles() {
  return {
    name: 'portfolio-content',
    buildStart() { buildContent(); },
    configureServer(server) {
      server.watcher.add('content/**/*.md');
      server.watcher.on('all', (event, file) => {
        if (['add','change','unlink'].includes(event) && /[/\\]content[/\\].+\.md$/.test(file)) {
          buildContent();
          server.ws.send({type:'full-reload'});
        }
      });
    }
  };
}

export default defineConfig({plugins:[react(),contentFiles()]});
