FROM node:20-slim AS runner
WORKDIR /app
COPY dist ./dist
COPY node_modules ./node_modules
COPY package.json ./
RUN mkdir -p /app/uploads && chmod 750 /app/uploads
USER node
EXPOSE 3001
CMD ["node", "dist/index.js"]
