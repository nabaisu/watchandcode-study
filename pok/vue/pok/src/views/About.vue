<template>
  <div class="about">
    <h1>This is an about page</h1>
    <pre id="GFG_DOWN" style="color:green; font-size: 20px; font-weight: bold;">{{user}}</pre>
  </div>
</template>

<script>
import firebase from "firebase";
import db from "@/firebase/init";
export default {
  data() {
    return {
      user: ''
    };
  },
  mounted() {
    this.user = JSON.stringify(firebase.auth().currentUser, undefined, 4)
  }
};
</script>
