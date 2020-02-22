<template>
  <div class="dashboard">
   <!--  <b-form-group label="Button style radios with outline-primary variant and size lg">
      <b-form-radio-group
        id="btn-radios-2"
        v-model="showAll"
        :options="options"
        buttons
        button-variant="outline-primary"
        size="lg"
        name="radio-btn-outline"
        @change="getNumberofThingstoShow"
      ></b-form-radio-group>
    </b-form-group>
     -->
<b-card-group columns>
    <div v-for="(item, index) in userCatches" :key="index">
        <b-card 
        :title="allInformation[0].name"
        img-src="https://placekitten.com/g/400/450"
        img-alt="Image"
        img-top
        >
        <b-card-text>
            This is a wider card with supporting text below as a natural lead-in to additional content.
            This content is a little bit longer.
        </b-card-text>
        </b-card>
    </div>
</b-card-group>

    <h1>This is an about page</h1>
   <!-- <pre id="GFG_DOWN" style="color:green; font-size: 20px; font-weight: bold;">{{user}}</pre>
<b-button href="add">Add New</b-button>  -->
    <bottom-navbar :userc="user" :caughtinfo="userCatches"></bottom-navbar>
  </div>
</template>

<script>
import firebase from "firebase";
import db from "@/firebase/init";
import BottomNavbar from '@/components/BottomNavbar'

export default {
    components: {
        BottomNavbar,
    },
  data() {
    return {
      user: "",
      userCatches: [],
      totalPossible: 0, 
      allInformation: [],
      showAll: false,
      options: [
        { text: "all", value: false },
        { text: "caught", value: true }
      ]
    };
  },
  mounted() {
    this.user = firebase.auth().currentUser;
    this.getUsersCaught();
    
    this.checkAnimalsCollection();
  },
  methods: {
      getUsersCaught(){
          let usersCaughtCollection = db.collection('caught').doc(this.user.uid);
          usersCaughtCollection.get().then((doc)=> {
            this.userCatches = doc.data().cats;
          })
      },
      /*
      checkIfUserHas(){
        return userCatches.find(function( ele ) {
            return ele.id === index;
        });
      },
    getNumberofThingstoShow() {
        if (this.showAll) {
        this.totalPossible = JSON.parse(localStorage.getItem("cats")).info.length || 0;
            } else {
        this.totalPossible = this.userCatches.length || 0;
        }
        return this.totalPossible || 0
    },
    */
    checkAnimalsCollection() {
      if (localStorage.getItem("cats") === null) {
        //means that the information was not yet fetched
        this.fetchInitialInformation();
      } else {
        this.allInformation = JSON.parse(localStorage.getItem("cats")).info
      }
    },
    fetchInitialInformation() {
      let catsInitialCollection = db.collection("animals").doc('cats');
      catsInitialCollection.get().then(doc => {
        localStorage.setItem("cats", JSON.stringify(doc.data()));
        this.allInformation = doc.data().info
      });
    },
    storeAnimalsCollection() {}
  }
};
</script>