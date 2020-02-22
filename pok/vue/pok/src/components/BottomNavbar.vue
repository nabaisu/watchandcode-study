<template>
<div v-if="userc">
    <b-navbar toggleable="lg" type="dark" variant="info">

    <b-navbar-brand href="#">
      <img src="https://placekitten.com/g/30/30" class="d-inline-block align-top" alt="Kitten">
      BootstrapVue
    </b-navbar-brand>
    <b-navbar-brand href="#">
      {{caughtinfo.length || 0}}
    </b-navbar-brand>

  </b-navbar>
</div>
</template>

<script>
import firebase from 'firebase'
export default {
  name: 'Navbar',
  props: ['userc','caughtinfo'],
}
</script>

<style>
</style>