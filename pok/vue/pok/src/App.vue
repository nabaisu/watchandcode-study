<template>
  <div id="app">
    <Navbar />
    <router-view/>
  </div>
</template>

<script>
import firebase from 'firebase'
import Navbar from '@/components/Navbar'
import BottomNavbar from '@/components/BottomNavbar'
export default {
  components: {
    Navbar,
    BottomNavbar
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
