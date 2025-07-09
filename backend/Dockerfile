# Dockerfile para Backend
FROM node:18-alpine AS backend

WORKDIR /app/backend

# Copiar package.json e package-lock.json
COPY backend/package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY backend/ .

# Expor porta
EXPOSE 4000

# Comando para iniciar
CMD ["npm", "start"]
