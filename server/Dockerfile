FROM node:20-alpine

# Cria a pasta do app no container
WORKDIR /app

# Copia os arquivos de dependência primeiro (para usar cache do Docker)
COPY package*.json ./

# Instala apenas as dependências de produção
RUN npm ci --only=production

# Copia o resto dos arquivos do servidor
COPY . .

# A porta que o Cloud Run/Railway vai usar
ENV PORT=8080
EXPOSE 8080

# Inicia o servidor
CMD ["node", "index.js"]
