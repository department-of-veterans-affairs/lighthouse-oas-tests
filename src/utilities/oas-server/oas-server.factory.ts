import { ServerObject } from 'swagger-client/schema';
import OASServer from './oas-server';

class OASServerFactory {
  public static getServers(servers: ServerObject[] | undefined): OASServer[] {
    if (servers === undefined) {
      return [];
    }
    return servers.map((server) => new OASServer(server.url));
  }
}

export default OASServerFactory;
