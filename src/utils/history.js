//usamos nuestro propio History para poder usar el interceptor, ya que no podemos usar solamente UseNavigate si queremos
//movernos por fuera del Hook de react.
import { createBrowserHistory } from 'history';

const history = createBrowserHistory();

export default history;