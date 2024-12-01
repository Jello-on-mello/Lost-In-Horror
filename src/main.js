import {Application} from 'pixi.js';

(async() => {
  
  const app = new Application();

  await app.init({
    width: window.innerWidth    ,
    height: window.innerHeight
    });

    app.canvas.style.position = 'absolute';

  document.body.appendChild(app.canvas);

  

})();