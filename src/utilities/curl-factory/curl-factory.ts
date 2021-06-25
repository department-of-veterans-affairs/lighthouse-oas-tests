import HTTPSnippet from 'httpsnippet';
import { Request } from 'swagger-client';

interface HARHeader {
  name: string;
  value?: string;
  comment?: string;
}

class CurlFactory {
  static buildFromRequest(request: Request): string {
    const harHeaders = Object.entries(request.headers).reduce<HARHeader[]>(
      (headers, [key, value]) => {
        if (key === 'apikey') {
          value = '*****';
        }
        return [...headers, { name: key, value }];
      },
      [],
    );
    const harRequest = {
      ...request,
      headers: harHeaders,
    } as unknown as HTTPSnippet.Data;
    const snippet = new HTTPSnippet(harRequest);
    return snippet.convert('shell') || '';
  }
}

export default CurlFactory;
