import * as THREE from 'three'
import Experience from '../Experience'

export default class Mouse{
   constructor() {

      this.experience = new Experience()
      this.sizes = this.experience.sizes
      this.pointer = new THREE.Vector2()

      this.bindMouse = this.mouseEvent.bind(this)
      window.addEventListener('mousemove', this.bindMouse)
   }

   mouseEvent(e) {
      this.pointer.x = (e.clientX / this.sizes.width) * 2 - 1
      this.pointer.y = - (e.clientY / this.sizes.height) * 2 + 1
   }

   dispose() {
      window.removeEventListener('mousemove', this.bindMouse)
   }

}