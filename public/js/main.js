export const Main = {
    init: async function(callback){
        let a = await this.lerArquivoINI("config.ini", this.processarINI);
        if(typeof callback == 'function') callback(_config);
        return this;
    },

    lerArquivoINI: function(arquivo, callback) {
       return fetch(arquivo)
        .then(response => response.text())
        .then(callback);
    },
  
    processarINI: function(conteudoINI) {
        window._config = {};
        let secaoAtual = null;
    
        conteudoINI.split("\n").forEach(linha => {
        linha = linha.trim();
    
        if (linha === "" || linha.startsWith(";")) {
            return;
        }
    
        if (linha.startsWith("[")) {
            secaoAtual = linha.substring(1, linha.length - 1);
            _config[secaoAtual] = {};
        } else if (linha.includes("=")) {
            const [chave, valor] = linha.split("=").map(item => item.trim());
            _config[secaoAtual][chave] = valor;
        }
        });
  
        // console.log(_config);

        return this;
    },

}


  
  
 


  