<template>
<div>
    <b-navbar toggleable="lg" type="dark" variant="info">

    <b-navbar-brand href="#">
      <img src="https://placekitten.com/g/30/30" class="d-inline-block align-top" alt="Kitten">
      BootstrapVue
    </b-navbar-brand>

    <b-collapse id="nav-collapse" is-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">

        <b-nav-item-dropdown v-if="user" right>
          <!-- Using 'button-content' slot -->
          <template v-slot:button-content>
            <em>{{ user.uid }}</em>
          </template>
          <b-dropdown-item v-if="user">{{ user.email }}</b-dropdown-item>
          <b-dropdown-item v-if="user" @click="logout">Sign Out</b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item-dropdown v-else right>
          <!-- Using 'button-content' slot -->
          <template v-slot:button-content>
            <em>falta favicon</em>
          </template>
          <b-dropdown-item v-if="!user"><router-link :to="{ name: 'Login' }">Login</router-link></b-dropdown-item>
          <b-dropdown-item v-if="!user"><router-link :to="{ name: 'Signup' }">Signup</router-link></b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</div>
</template>

<script>
import firebase from 'firebase'
export default {
  name: 'Navbar',
  data(){
    return{
      user: null
    }
  },
  created(){
    // let user = firebase.auth().currentUser
    firebase.auth().onAuthStateChanged((user) => {
      if(user){
        this.user = user
      } else {
        this.user = null
      }
    })    
  },
  methods: {
    logout(){
      firebase.auth().signOut().then(() => {
        this.$router.push({ name: 'Login' })
      })
    }
  }
}
</script>

<style>
</style>