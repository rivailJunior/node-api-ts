import { SetupServer } from './server';
import config from 'config';

(async (): Promise<void> => {
    const server = new SetupServer(config.get('App.port'));
    server.init();
    server.start();
})();
