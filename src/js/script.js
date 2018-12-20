var santaSpeed = 10; // refresh le pere noël toutes les 10ms
var stageSpeed = 10; // refresh le stage toutes les 10ms
var directionLeft = "left"; // initalise la variable directionLeft à left
var directionDown = "down"; // initalise la variable directionDown à down
var gravity = 4; // le santa tombera de 1px toutes les santaSpeed milliSecondes
var size = 4; // le stage bougera de 4px toutes les stageSpeed milliSecondes
var santa;
var santaInterval;
var stageInterval;
var initialGround;
var giftSpeed = 10; // refresh le cadeau toutes les 10ms
var giftCollisionTester; // déclare la variable qui permet de détecter la collision entre le sol et un cadeau (plateforme juste au dessus du sol sous le personnage)
var lifeCounter = 3; // initie le nombre de vies à 3 au démarrage

oxo.inputs.listenKeyOnce("enter", function() {
  // lorsque l'on appuie sur entrée
  if (oxo.screens.getCurrentScreen() !== "game") {
    // et que l'écran actuel n'est pas game
    oxo.screens.loadScreen("game", function() {
      // load le screen game
      // appelle les fonctions générants aléatoirement respectivement les cheminées et le sol
      setTimeout(fireplaceGeneration, 2000);
      setTimeout(groundGeneration, 100);
      giftCollisionTester = oxo.elements.createElement({
        // crée l'élément sous le santa afin de détecter la collision au sol avec les cadeaux
        class: "stage__gift--tester"
      });
      santaInterval = setInterval(playerFall, santaSpeed); // permet le saut du santa
      stageInterval = setInterval(initialGroundMove, stageSpeed); // bouge le sol initial vers la gauche
      initialGround = oxo.elements.createElement({
        // crée le sol initial (sans sol initial le santa tombe direct car il n'y a pas encore de sol généré car le sol généré est à droite de l'écran)
        class: "initial__ground",
        obstacle: true
      });
      santa = oxo.elements.createElement({
        // crée le santa
        class: "character__santa",
        styles: {
          transform: "translate(50px, 549px)" // positionne le santa sur le sol
        }
      });
      oxo.elements.onLeaveScreenOnce(
        // une fois que le sol initial sort de l'écran, on le delete du html pour les performances
        initialGround,
        function() {
          initialGround.remove();
          clearInterval(stageInterval);
          console.log("initial ground Left");
        },
        true
      );
      oxo.inputs.listenKey("z", function() {
        // lorsqu'on appuie sur z
        var yPos = oxo.animation.getPosition(santa).y + 150; // récupère la position du santa
        var gift = oxo.elements.createElement({
          // puis crée un élément cadeau sous lui
          class: "stage__gift",
          styles: {
            transform: "translate(100px, " + yPos + "px)"
          }
        });
        setInterval(function() {
          // mouvement du cadeau (gravité)
          oxo.animation.move(gift, directionDown, 5, true);
        }, giftSpeed);

        var gifts = document.querySelectorAll(".stage__gift"); // on récupère tous les cadeaux dans un tableau
        gifts.forEach(function(newGift) {
          oxo.elements.onCollisionWithElementOnce(
            newGift,
            giftCollisionTester,
            function() {
              // si un cadeau collision avec le sol (plus exactement l'élément giftCollisionTester, qui est un sol invisible jusqu'au dessus du sol car le vrai sol est un obstacle et la collision est donc impossible)
              newGift.remove(); // on supprime le cadeau
              lifeCounter = lifeCounter - 1; // le joueur perds une vie
              if (lifeCounter <= 0) {
                // quand le joueur n'a plus de vies
                oxo.screens.loadScreen("end", function() {
                  // load l'écran end
                });
              }
            }
          );
        });

        var fireplaces = document.querySelectorAll(".stage__fireplace"); // on récupère toutes les cheminées dans un tableau
        fireplaces.forEach(function(fireplace) {
          oxo.elements.onCollisionWithElementOnce(gift, fireplace, function() {
            // à la collision avec une cheminée
            if (oxo.animation.getPosition(gift).y < 515) {
              // et seulement si le cadeau vient du haut
              oxo.player.addToScore(1000); // alors le joueur gagne des points
              gift.remove(); // et le cadeau est supprimé
            }
          });
        });
      });
    });
  }
});

function updateScore() {
  // met à jour le score quand cette fonction est appelée
  document.getElementById("score").innerText = oxo.player.getScore();
}

function fireplaceGeneration() {
  // créer un élément cheminée
  var fireplaceEl = oxo.elements.createElement({
    class: "stage__fireplace"
  });

  var fireInterval = setInterval(function() {
    // bouge la cheminée vers la gauche de "size" pixels toutes les 10ms
    oxo.animation.move(fireplaceEl, directionLeft, size, true);
  }, 10);

  oxo.elements.onLeaveScreenOnce(
    // la cheminée disparait à la sortie de l'écran
    fireplaceEl,
    function() {
      fireplaceEl.remove();
      clearInterval(fireInterval);
      console.log("fireplace left");
    },
    true
  );
  setTimeout(fireplaceGeneration, 1000 * oxo.utils.getRandomNumber(1.5, 3.5));
  // rappelle cette  fonction toutes les 1.5 à 3.5  secondes
}

function groundGeneration() {
  var ground = oxo.elements.createElement({
    class: "stage__ground",
    obstacle: true,
    styles: {
      transform: "translateX(1380px)"
    }
  });

  var groundInterval = setInterval(function() {
    oxo.animation.move(ground, directionLeft, size, true);
  }, 10);

  oxo.elements.onLeaveScreenOnce(
    ground,
    function() {
      ground.remove();
      clearInterval(groundInterval);
      console.log("ground Left");
    },
    true
  );
  setTimeout(groundGeneration, 5500 + oxo.utils.getRandomNumber(0, 1000));
}

function jump() {
  // saut du santa
  if (gravity > 0) {
    gravity = -gravity;
    setTimeout(function() {
      gravity = -gravity;
    }, 1000);
  }
}

function playerFall() {
  // le santa tombe toujours de "gravity" pixel toutes les "santaSpeed" secondes (voir santaInterval)
  oxo.animation.move(santa, directionDown, gravity, true);
  if (lifeCounter > 0) {
    oxo.player.addToScore(1);
  }
  updateScore();
}

function initialGroundMove() {
  // bouge le sol initial vers la gauche de "size" pixel toutes les "stageSpeed" secondes (voir stageInterval)
  oxo.animation.move(initialGround, directionLeft, size, true);
}

oxo.inputs.listenKey("up", function() {
  // fais sauter le santa quand on appuie sur up
  jump();
});
