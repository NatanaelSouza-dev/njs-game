# Exige que você tenha as ferramentas instaladas e logadas:
# 1. firebase-tools (npm i -g firebase-tools) -> firebase login
# 2. gcloud CLI (Google Cloud SDK) -> gcloud auth login

Write-Host "================================="
Write-Host "🚀 INICIANDO DEPLOY DO JOGO"
Write-Host "================================="

# 1. Frontend
Write-Host "`n[1/2] Fazendo Deploy do Frontend no Firebase Hosting..."
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no deploy do frontend." -ForegroundColor Red
    exit
}

# 2. Backend
Write-Host "`n[2/2] Fazendo Deploy do Backend no Google Cloud Run..."
Write-Host "Enviando a pasta server/ para a nuvem..."

# Ajuste a região se o seu projeto Firebase estiver em outra região
gcloud run deploy colyseus-server `
  --source ./server `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --port 8080

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no deploy do backend." -ForegroundColor Red
    exit
}

Write-Host "`n================================="
Write-Host "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
Write-Host "Lembre-se de atualizar a URL do backend no seu client/game.js"
Write-Host "================================="
