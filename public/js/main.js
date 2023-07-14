export const Main = {
    init: async function(callback){
        window._config = {};
        window._debug = null;
        await this.lerArquivoINI("config.ini", this.processarINI);
        if(typeof callback == 'function') callback(_config);
        window._debug = _config[_config['build']['environment']]['debugger'] == 'true' ? true : false
        return this;
    },
    lerArquivoINI: async function(arquivo, callback) {
        const response = await fetch(arquivo);
        const content = await response.text();
        callback.call(this, content);
    },
    processarINI: function(conteudoINI) {
        let secaoAtual = null;
        conteudoINI.split("\n").forEach(linha => {
            linha = linha.trim();
            if (linha === "" || linha.startsWith(";")) return;
            if (linha.startsWith("[")) {
                secaoAtual = linha.substring(1, linha.length - 1);
                _config[secaoAtual] = {};
            } else if (linha.includes("=")) {
                const [chave, valor] = linha.split("=").map(item => item.trim());
                _config[secaoAtual][chave] = valor;
            }
        });
        return this;
    },
}


  
  
 


  