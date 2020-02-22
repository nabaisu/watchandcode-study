<template>
  <div class="signup container">
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
                    <form class="user" @submit.prevent="signup">
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
                        <input
                          type="password"
                          class="form-control form-control-user"
                          id="repeatInputPassword"
                          placeholder="Password"
                          v-model="repeatPassword"
                        />
                      </div>
                      <div class="form-group">
                        <input
                          class="form-control form-control-user"
                          id="username"
                          placeholder="Username"
                          v-model="alias"
                        />
                      </div>
                      <div class="form-group">
                        <div class="custom-control custom-checkbox small">
                          <input type="checkbox" class="custom-control-input" id="customCheck" />
                          <label class="custom-control-label" for="customCheck">Remember Me</label>
                        </div>
                      </div>
                      <button class="btn btn-primary btn-user btn-block">Signup</button>
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
                      <router-link class="small" :to="{ name: 'Login' }">Already have an Account?</router-link>
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
import db from "@/firebase/init";
import slugify from "slugify";
import firebase from "firebase";
export default {
  name: "Signup",
  data() {
    return {
      email: null,
      password: null,
      repeatPassword: null,
      alias: null,
      feedback: null,
      slug: null
    };
  },
  methods: {
    signup() {
      if (this.alias && this.email && this.password) {
        this.feedback = null;
        this.slug = slugify(this.alias, {
          replacement: "-",
          remove: /[$*_+~.()'"!\-:@]/g,
          lower: true
        });
        let ref = db.collection("users").doc(this.slug);
        ref.get().then(doc => {
          if (doc.exists) {
            this.feedback = "This alias already exists";
          } else {
            // this alias does not yet exists in the db
            firebase
              .auth()
              .createUserWithEmailAndPassword(this.email, this.password)
              .then(user => {
                ref.set({
                  alias: this.alias,
                  geolocation: null,
                  user_id: user.uid
                });
              })
              .then(() => {
                this.$router.push({ name: "Login" });
              })
              .catch(err => {
                this.feedback = err.message;
              });
          }
        });
      } else {
        this.feedback = "Please fill in all fields";
      }
    }
  }
};
</script>