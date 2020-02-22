<template>
  <div class="login container">
    <div class="container">
      <!-- Outer Row -->
      <div class="row justify-content-center">
        <div class="col-xl-10 col-lg-12 col-md-9">
          <div class="card o-hidden border-0 shadow-lg my-5">
            <div class="card-body p-0">
              <!-- Nested Row within Card Body -->
              <div class="row">
                <div class="col-lg-6 d-none d-lg-block bg-login-image"></div>
                <div class="col-lg-6">
                  <div class="p-5">
                    <div class="text-center">
                      <h1 class="h4 text-gray-900 mb-4">Welcome Mr</h1>
                    </div>
                    <form class="user" @submit.prevent="login">
                      <div class="form-group">
                        <input
                          type="email"
                          class="form-control form-control-user"
                          id="exampleInputEmail"
                          aria-describedby="emailHelp"
                          placeholder="Enter Email Address..."
                          v-model="email"
                        />
                      </div>
                      <div class="form-group">
                        <input
                          type="password"
                          class="form-control form-control-user"
                          id="exampleInputPassword"
                          placeholder="Password"
                          v-model="password"
                        />
                      </div>
                      <div class="form-group">
                        <div class="custom-control custom-checkbox small">
                          <input type="checkbox" class="custom-control-input" id="customCheck" />
                          <label class="custom-control-label" for="customCheck">Remember Me</label>
                        </div>
                      </div>
                      <button class="btn btn-primary btn-user btn-block">Login</button>
                      <p v-if="feedback" class="red-text center">{{ feedback }}</p>
                      <hr class="d-none" />
                      <button class="btn btn-google btn-user btn-block d-none">
                        <i class="fab fa-google fa-fw"></i> Login with Google
                      </button>
                      <button class="btn btn-facebook btn-user btn-block d-none">
                        <i class="fab fa-facebook-f fa-fw"></i> Login with Facebook
                      </button>
                    </form>
                    <hr />
                    <div class="text-center">
                      <router-link class="small" :to="{ name: '404' }">Forgot Password?</router-link>
                    </div>
                    <div class="text-center">
                      <router-link class="small" :to="{ name: 'Signup' }">Create an Account!</router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from "firebase";
import firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import db from "@/firebase/init";

export default {
  name: "Login",
  data() {
    return {
      email: null,
      password: null,
      feedback: null
    };
  },
  methods: {
    login() {
      if (this.email && this.password) {
        this.feedback = null;
        firebase
          .auth()
          .signInWithEmailAndPassword(this.email, this.password)
          .then(user => {
            //check if the collection exists
            this.createCatchCollection(user);
            this.$router.push({ name: "Home" });
          })
          .catch(err => {
            this.feedback = err.message;
          });
      } else {
        this.feedback = "Please fill in both fields";
      }
    },
    createCatchCollection(user) {
      let newCatchCollection = db.collection("caught").doc(user.user.uid);
      newCatchCollection.get().then(doc => {
        if (doc.exists) {
          this.feedback = "This user already exists";
        } else {
          // this alias does not yet exists in the db
          newCatchCollection
            .set({
              cats: []
            })
            .catch(function(error) {
              this.feedback = "Error writing document: ", error;
            });
        }
      });
    }
  }
};
</script>