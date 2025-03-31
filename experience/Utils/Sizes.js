import EventEmitter from "./EventEmitter"

export default class Sizes extends EventEmitter {
   constructor() {
      super()

      this.width = window.innerWidth
      this.height = window.innerHeight
      this.pixelRatio = Math.min(window.devicePixelRatio, 2)
      this.bindResize = this.resize.bind(this)
      window.addEventListener('resize', this.bindResize)
   }

   resize() {
      this.width = window.innerWidth
      this.height = window.innerHeight
      this.pixelRatio = Math.min(window.devicePixelRatio, 2)
      this.trigger('resize')
   }

   dispose() {
      window.removeEventListener('resize', this.bindResize)
   }
}