import React from "react";
import '../styles/Common.scss';

const prueba = (props) => {

  return (
    <div>
      guia de uso: cambiar el classname en layout para ver los diferentes temas. aqui hay ejemplos tanto de los colores como de algunos elementos hechos en common.css
      <hr />
      colores disponibles en texto:
      <div style={{ color: 'var(--color-text-primary)' }}>--color-text-primary</div>
      <div style={{ color: 'var(--color-text-secondary)' }}>--color-text-secondary</div>
      <div style={{ color: 'var(--color-text-alt)' }}>--color-text-alt</div>
      <div style={{ color: 'var(--color-links)' }}>--color-links</div>
      <div style={{ color: 'var(--color-h1)' }}>--color-h1</div>
      <div style={{ color: 'var(--color-h2)' }}>--color-h2</div>
      <div style={{ color: 'var(--color-h3)' }}>--color-h3</div>
      <hr />
      colores disponibles en fondos:
      <div style={{ backgroundColor: 'var(--color-background)' }}>--color-background</div>
      <div style={{ backgroundColor: 'var(--color-foreground)' }}>--color-foreground</div>
      <hr />

      <h1>H1 Lorem ipsum dolor sit amet, consectetur adipiscing elit. </h1>
      <h2>H2 Lorem ipsum dolor sit amet, consectetur adipiscing elit. </h2>
      <h3>H3 Lorem ipsum dolor sit amet, consectetur adipiscing elit. </h3>
      <hr />

      BODY plain text: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      <hr />
      <p>p Lorem ipsum dolor sit amet, consectetur adipiscing elit. </p>
      <hr />
      <a href="https://example.com" target="_blank" rel="noopener noreferrer">
        Este es un enlace (a)
      </a>
      <hr />
      <ul>
        <li>Elemento de lista (ul/li) 1</li>
        <li>Elemento de lista (ul/li) 2</li>
        <li>Elemento de lista (ul/li) 3</li>
      </ul>

      <ol>
        <li>Elemento de lista ordenada (ol/li) 1</li>
        <li>Elemento de lista ordenada (ol/li) 2</li>
        <li>Elemento de lista ordenada (ol/li) 3</li>
      </ol>
      <hr />
      <blockquote>
        Este es un blockquote. "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      </blockquote>
      <hr />
      <span>SPAN Lorem ipsum dolor sit amet, consectetur adipiscing elit.  texto.</span>
      <hr />
      <div>
        div adicional
        <div>
          div adicional 2
        </div>
      </div>
      <hr />
      <pre>
        {`Este es un bloque preformateado (pre):
function hola() {
  console.log('Hola mundo');
}`}
      </pre>
      <hr />
      <code>CODE Este es un fragmento de código inline: console.log('Hola');</code>
      <hr />
      TABLE
      <table>
        <thead>
          <tr>
            <th>Encabezado 1</th>
            <th>Encabezado 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Fila 1, Celda 1</td>
            <td>Fila 1, Celda 2</td>
          </tr>
          <tr>
            <td>Fila 2, Celda 1</td>
            <td>Fila 2, Celda 2</td>
          </tr>
        </tbody>
      </table>

      <hr />
      FORM
      <form>
        <label>
          Input de texto:
          <input type="text" placeholder="label: Escribe algo..." />
        </label>
        <br />
        <label>
          Checkbox:
          <input type="checkbox" />
        </label>
        <br />
        <label>
          Radio:
          <input type="radio" name="opcion" />
        </label>
        <br />
        <button>Botón</button>
      </form>
      <hr />
      <img src="http://localhost:8082/assets/default/pfp.png" alt="Imagen de prueba" />

    </div>
  );
};

export default prueba;
