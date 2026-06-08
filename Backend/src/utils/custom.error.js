class TransientError extends Error {
     constructor(message) {
        super(message);
        this.name = 'TransientError';
    }
}
class PermenantError extends Error {
    constructor (message){
        super(message);
        this.name='PermenantError';
    }
}
export {TransientError,PermenantError}