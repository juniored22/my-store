class CameraProvider {
    constructor(videoElement, errorMessageElement) {
        this.videoElement = videoElement;
        this.errorMessageElement = errorMessageElement;
    }

    // Função para exibir mensagens de erro
    displayError(message) {
        this.errorMessageElement.textContent = message;
    }

    // Função para verificar suporte a getUserMedia
    isGetUserMediaSupported() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    // Função para obter o stream de vídeo
    async getVideoStream() {

        const constraints = {
            video: {
                facingMode: 'user', // Pode ser 'environment' para a câmera traseira
            },
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            // Verificar se o stream contém pelo menos uma track de vídeo
            if (!stream.getVideoTracks().length) {
                throw new Error('Erro: Não foi possível acessar a câmera.');
            }

            return stream;
        } catch (error) {
            switch (error.name) {
                case 'NotAllowedError':
                    throw new Error('Erro: Permissão de câmera negada pelo usuário.');
                case 'NotFoundError':
                    throw new Error('Erro: Nenhuma câmera encontrada no dispositivo.');
                case 'NotReadableError':
                    throw new Error('Erro: A câmera está sendo usada por outra aplicação.');
                case 'OverconstrainedError':
                    throw new Error('Erro: As restrições especificadas não puderam ser satisfeitas pela câmera.');
                case 'SecurityError':
                    throw new Error('Erro: Falha de segurança ao acessar a câmera.');
                default:
                    throw new Error(`Erro desconhecido: ${error.message}`);
            }
        }
    }

    // Função para inicializar a câmera
    async init() {
        if (!this.isGetUserMediaSupported()) {
            this.displayError('Erro: getUserMedia não é suportado pelo seu navegador.');
            return;
        }

        try {
            const stream = await this.getVideoStream();
            
            // Verificar se o stream contém pelo menos uma track de vídeo
            if (!stream.getVideoTracks().length) {
                this.displayError('Erro: Não foi possível acessar a câmera.');
                return;
            }

            this.videoElement.srcObject = stream;
        } catch (error) {
            this.handleError(error);
        }
    }

    // Função para iniciar a câmera
    async startCamera() {
        // Verificar se o navegador suporta getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.displayError('Erro: getUserMedia não é suportado pelo seu navegador.');
            return;
        }

        try {
            const constraints = {
                video: {
                    facingMode: 'user', // Pode ser 'environment' para a câmera traseira
                },
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            // Verificar se o stream contém pelo menos uma track de vídeo
            if (!stream.getVideoTracks().length) {
                this.displayError('Erro: Não foi possível acessar a câmera.');
                return;
            }

            this.videoElement.srcObject = stream;
        } catch (error) {
            this.handleError(error);
        }
    }

    // Função para tratar erros específicos
    handleError(error) {
        switch (error.name) {
            case 'NotAllowedError':
                this.displayError('Erro: Permissão de câmera negada pelo usuário.');
                break;
            case 'NotFoundError':
                this.displayError('Erro: Nenhuma câmera encontrada no dispositivo.');
                break;
            case 'NotReadableError':
                this.displayError('Erro: A câmera está sendo usada por outra aplicação.');
                break;
            case 'OverconstrainedError':
                this.displayError('Erro: As restrições especificadas não puderam ser satisfeitas pela câmera.');
                break;
            case 'SecurityError':
                this.displayError('Erro: Falha de segurança ao acessar a câmera.');
                break;
            default:
                this.displayError(`Erro desconhecido: ${error.message}`);
                break;
        }
    }
}


export default CameraProvider;