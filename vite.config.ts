import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import webpush from 'web-push';
import express from 'express';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(), 
        tailwindcss(),
        {
          name: 'api-push',
          configureServer(server) {
            server.middlewares.use(express.json());
            server.middlewares.use(async (req, res, next) => {
              if (req.url === '/api/push/generate-keys') {
                const vapidKeys = webpush.generateVAPIDKeys();
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(vapidKeys));
              } else if (req.url === '/api/push/subscribe') {
                res.statusCode = 201;
                res.end(JSON.stringify({}));
              } else if (req.url === '/api/push/send') {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', async () => {
                  try {
                    const { subscription, title, body: msgBody } = JSON.parse(body);
                    const publicVapidKey = process.env.VITE_VAPID_PUBLIC_KEY;
                    const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
                    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:example@yourdomain.com';

                    if (publicVapidKey && privateVapidKey) {
                      webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
                      await webpush.sendNotification(subscription, JSON.stringify({ title, body: msgBody }));
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({ success: true }));
                    } else {
                      res.statusCode = 500;
                      res.end(JSON.stringify({ error: 'VAPID keys not configured' }));
                    }
                  } catch (e) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: 'Failed to send' }));
                  }
                });
              } else {
                next();
              }
            });
          }
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
