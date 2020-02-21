<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<script>
import firebase from 'firebase'
import db from '@/firebase/init'
  export default {
    mounted() {
      let user = firebase.auth().currentUser;
      alert(JSON.stringify(user))
    }
  }
</script>
