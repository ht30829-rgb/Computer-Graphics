const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Advanced Shape class
class Shape {
  constructor(x, y, size, color, speed, angle, type) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.speed = speed;
    this.angle = angle; // direction in radians
    this.type = type;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle); // rotate shape for effect
    ctx.fillStyle = this.color;
    ctx.beginPath();
    
    if (this.type === "circle") {
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === "square") {
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    } else if (this.type === "triangle") {
      ctx.moveTo(0, -this.size);
      ctx.lineTo(-this.size, this.size);
      ctx.lineTo(this.size, this.size);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
  }

  update() {
    // Curved motion: slightly change angle randomly
    this.angle += (Math.random() - 0.5) * 0.05;

    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    // Bounce off walls
    if (this.x - this.size < 0 || this.x + this.size > canvas.width) this.angle = Math.PI - this.angle;
    if (this.y - this.size < 0 || this.y + this.size > canvas.height) this.angle = -this.angle;

    this.draw();
  }
}

// Create shapes with random speeds and starting angles
const shapes = [
  new Shape(150, 150, 50, 'red', 3, Math.random() * Math.PI * 2, 'circle'),
  new Shape(400, 300, 60, 'blue', 2.5, Math.random() * Math.PI * 2, 'square'),
  new Shape(700, 200, 40, 'green', 4, Math.random() * Math.PI * 2, 'triangle')
];

// Animation loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  shapes.forEach(shape => shape.update());
  requestAnimationFrame(animate);
}

animate();


