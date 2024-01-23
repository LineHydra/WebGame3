document.addEventListener('DOMContentLoaded', function () {
    const spielBrett = document.getElementById('spielBrett');
    const pitbulls = [];
    const babyStatus = {};
  
    const gridStatus = Array(10).fill().map(() => Array(5).fill(false));
  
    function createBrettElement() {
      const brettElement = document.createElement('div');
      brettElement.classList.add('BrettElement', 'Gras');
      spielBrett.appendChild(brettElement);
    }
  
    function createObject(className, array, objectStatus, health) {
      const objectElement = document.createElement('div');
      objectElement.classList.add(className);
      objectElement.health = health;
      array.push(objectElement);
      return objectElement;
    }
  
    function createBaby() {
      const babyElement = createObject('Platzierbar', [], babyStatus, 100);
      babyElement.draggable = true;
  
      const babyId = `Baby${Object.keys(babyStatus).length + 1}`;
      babyElement.id = babyId;
  
      document.body.appendChild(babyElement);
  
      babyStatus[babyId] = false;
  
      handleObjectDrag(babyElement);
    }

    function babyAttack(babyElement) {
        setInterval(() => {
          if (isObjectLocked(babyElement.id, babyStatus)) {
            const projectileElement = createObject('Projektil', projectiles, null, 50);

            projectileElement.classList.add('Projektil');
            
            const babyRect = babyElement.getBoundingClientRect();
            const projectileStartX = babyRect.left + babyRect.width / 2 - projectileElement.clientWidth / 2;
            const projectileStartY = babyRect.top - projectileElement.clientHeight;
            
            projectileElement.style.left = `${projectileStartX}px`;
            projectileElement.style.top = `${projectileStartY}px`;
            
            document.body.appendChild(projectileElement);
            
            moveProjectile(projectileElement);
          }
        }, 1500);
      }
      
      function moveProjectile(projectileElement) {
        const projectileSpeed = 5;
      
        function update() {
          const projectileTop = parseFloat(projectileElement.style.top) - projectileSpeed;
          projectileElement.style.top = `${projectileTop}px`;
      
          if (projectileTop + projectileElement.clientHeight < 0) {

            document.body.removeChild(projectileElement);
          } else {

            checkProjectileCollision(projectileElement);
            requestAnimationFrame(update);
          }
        }
        update();
    }

    function checkProjectileCollision(projectileElement) {
        const projectileRect = projectileElement.getBoundingClientRect();
      
        pitbulls.forEach((pitbullElement) => {
          const pitbullRect = pitbullElement.getBoundingClientRect();
      
          if (
            projectileRect.left < pitbullRect.right &&
            projectileRect.right > pitbullRect.left &&
            projectileRect.top < pitbullRect.bottom &&
            projectileRect.bottom > pitbullRect.top
          ) {

            document.body.removeChild(projectileElement);
            handlePitbullHit(pitbullElement);
          }
        });
      }
      
      function handlePitbullHit(pitbullElement) {
       
        pitbullElement.health -= 10;
      
        if (pitbullElement.health <= 0) {

          defeatPitbull(pitbullElement);
        }
      }
      
      function defeatPitbull(pitbullElement) {

        const index = pitbulls.indexOf(pitbullElement);
        if (index !== -1) {
          pitbulls.splice(index, 1);
          document.body.removeChild(pitbullElement);
      

          if (pitbulls.length === 0) {
            handleGameOver();
          }
        }
      }

    function createPitbull() {
        const pitbullElement = createObject('Pitbull', pitbulls, null, 100);
    
        const randomGridRow = Math.floor(Math.random() * 5) + 0;
        const gridRowHeight = spielBrett.clientHeight / 5;
        const pitbullTop = randomGridRow * gridRowHeight - pitbullElement.clientHeight / 1;
    
        pitbullElement.style.top = `${pitbullTop}px`;
    
        spielBrett.appendChild(pitbullElement);
        pitbulls.push(pitbullElement);
    
        movePitbull(pitbullElement);
        
    }
  
    function movePitbull(pitbullElement) {
        const speed = 2;
        const interval = 50;

        let currentPosition = pitbullElement.getBoundingClientRect().left;

        const moveInterval = setInterval(() => {
            currentPosition -= speed;
            pitbullElement.style.left = `${currentPosition}px`;

            const pitbullRect = pitbullElement.getBoundingClientRect();
            const babies = document.querySelectorAll('.Platzierbar');

            babies.forEach(baby => {
                const babyRect = baby.getBoundingClientRect();

                if (checkCollision(pitbullRect, babyRect)) {
                    clearInterval(moveInterval);
                    attackBaby(baby);

                    if (!checkPathBlocked(pitbullElement)) {
                        movePitbull(pitbullElement);
                    }

                    return;
                }
            });

            if (currentPosition <= 0) {
                clearInterval(moveInterval);

                handleGameOver();
            }
        }, interval);
    }

    function checkPathBlocked(pitbullElement) {
    const pitbullRect = pitbullElement.getBoundingClientRect();
    const babies = document.querySelectorAll('.Platzierbar');

    for (const baby of babies) {
        if (baby.health > 0) {
            const babyRect = baby.getBoundingClientRect();

            if (checkCollision(pitbullRect, babyRect)) {
                return true;
            }
        }
    }

    return false; 
}

  
    function checkCollision(rect1, rect2) {
      return (
        rect1.left < rect2.right &&
        rect1.right > rect2.left &&
        rect1.top < rect2.bottom &&
        rect1.bottom > rect2.top
      );
    }
  
    function attackBaby(babyElement) {
        babyElement.health -= 20; 
        if (babyElement.health <= 0) {
            deleteBaby(babyElement.id);
        } else {
           
            setTimeout(() => attackBaby(babyElement), 1000); 
        }
    }

      function deleteBaby(babyId) {
        const babyElement = document.getElementById(babyId);
        
        if (babyElement) {
          babyElement.parentNode.removeChild(babyElement);
          releaseField(getBabyGridPosition(babyElement));
          delete babyStatus[babyId];
        }
      }

      function checkPitbullsReachEnd() {
        const pitbullOffset = 200; 
        pitbulls.forEach((pitbullElement) => {
          const pitbullRect = pitbullElement.getBoundingClientRect();
      
          if (pitbullRect.left >= pitbullOffset) {
            showGameOverScreen();
          }
        });
      }

      function showGameOverScreen() {
        const gameOverScreen = document.createElement('div');
        gameOverScreen.classList.add('GameOverScreen');
        gameOverScreen.textContent = 'Game Over';
      
        document.body.appendChild(gameOverScreen);
      }
      
      function getBabyGridPosition(babyElement) {
        const rect = spielBrett.getBoundingClientRect();
        const cellWidth = rect.width / 10;
        const cellHeight = rect.height / 5;
      
        const babyRect = babyElement.getBoundingClientRect();
        const babyX = babyRect.left - rect.left + babyRect.width / 2;
        const babyY = babyRect.top - rect.top + babyRect.height / 2;
      
        const gridX = Math.floor(babyX / cellWidth);
        const gridY = Math.floor(babyY / cellHeight);
      
        return { x: gridX, y: gridY };
      }
      
  
    function handleGameOver() {

      console.log('Game Over');

    }
  
    function isFieldOccupied(x, y) {
      return gridStatus[x][y];
    }
  
    function occupyField(x, y) {
      gridStatus[x][y] = true;
    }
  
    function releaseField(x, y) {
      gridStatus[x][y] = false;
    }
  
    function isObjectLocked(objectId, objectStatus) {
      return objectStatus[objectId];
    }
  
    function lockObject(objectId, objectStatus) {
      objectStatus[objectId] = true;
    }
  
    function unlockObject(objectId, objectStatus) {
      objectStatus[objectId] = false;
    }
  
    function startGame() {
      createBaby();
      createBaby();

      setInterval(createBaby, 15000);
  
      createPitbull();
      setInterval(checkPitbullsReachEnd, 100);
  
      setInterval(createPitbull, 10000);
    }
  
    for (let i = 0; i < 50; i++) {
      createBrettElement();
    }
  
    function handleObjectDrag(objectElement) {
      let offsetX, offsetY;
      let isDragging = false;
  
      objectElement.addEventListener('mousedown', startDrag);
      objectElement.addEventListener('mousemove', drag);
      objectElement.addEventListener('mouseup', stopDrag);
  
      function startDrag(e) {
        if (!isObjectLocked(objectElement.id, babyStatus)) {
          isDragging = true;
          offsetX = e.clientX - objectElement.getBoundingClientRect().left;
          offsetY = e.clientY - objectElement.getBoundingClientRect().top;
        }
      }
  
      function drag(e) {
        if (isDragging) {
          const x = e.clientX - offsetX;
          const y = e.clientY - offsetY;
  
          objectElement.style.left = `${x}px`;
          objectElement.style.top = `${y}px`;
        }
      }
  
      function stopDrag() {
        if (isDragging) {
          isDragging = false;
  
          const rect = spielBrett.getBoundingClientRect();
          const cellWidth = rect.width / 10;
          const cellHeight = rect.height / 5;
  
          const objectRect = objectElement.getBoundingClientRect();
          const objectX = objectRect.left - rect.left + objectRect.width / 2;
          const objectY = objectRect.top - rect.top + objectRect.height / 2;
  
          const gridX = Math.floor(objectX / cellWidth);
          const gridY = Math.floor(objectY / cellHeight);
  
          if (!isFieldOccupied(gridX, gridY)) {
            occupyField(gridX, gridY);
  
            const newX = gridX * cellWidth + (cellWidth - objectRect.width) / 2 + rect.left;
            const newY = gridY * cellHeight + (cellHeight - objectRect.height) / 2 + rect.top;
  
            objectElement.style.left = `${newX}px`;
            objectElement.style.top = `${newY}px`;
  
            lockObject(objectElement.id, babyStatus);
          } else {
            objectElement.style.left = '';
            objectElement.style.top = '';
  
          }
        }
      }
    }
  
    // Starte das Spiel
    startGame();
  });
  