class Extension {
    async handle(data, from, port) {
        switch(data.command) {
            case 'new_wallet':
                return this.newWallet()
            default:
                return false
        }
    }

    newWallet() {
        return 'test'
    }
}

export default Extension