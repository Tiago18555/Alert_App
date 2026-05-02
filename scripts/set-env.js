const fs = require('fs');
const dotenv = require('dotenv');

// Carrega as variáveis do arquivo .env para o process.env
dotenv.config();

const signalrUrl = process.env.SIGNALR_URL || 'https://alert-system-tdde.onrender.com';

const envConfigFile = `export const environment = {
  production: false,
  signalrUrl: '${signalrUrl}'
};
`;

const envConfigFileProd = `export const environment = {
  production: true,
  signalrUrl: '${signalrUrl}'
};
`;

console.log('Gerando arquivos de ambiente...');

// Garante que o diretório existe (opcional, mas boa prática)
const dir = './src/environments';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync('./src/environments/environment.ts', envConfigFile);
console.log(`Arquivo gerado: ./src/environments/environment.ts`);

fs.writeFileSync('./src/environments/environment.prod.ts', envConfigFileProd);
console.log(`Arquivo gerado: ./src/environments/environment.prod.ts`);
