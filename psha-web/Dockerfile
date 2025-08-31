# Gunakan Node.js resmi
FROM node:20

# Atur working directory
WORKDIR /app

# Copy package.json & lockfile
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy semua kode frontend
COPY . .

# Expose port Vite
EXPOSE 5173

# Jalankan Vite dev server
CMD ["npm", "run", "dev", "--", "--host"]
