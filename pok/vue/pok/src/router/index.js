import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Login from '../views/auth/Login.vue'
import Signup from '../views/auth/Signup.vue'
import Dashboard from '../views/Dashboard.vue'
import Add from '../views/Add.vue'
import P404 from '../views/404.vue'
import firebase from 'firebase'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup
  },
  {
    path: '/404',
    name: '404',
    component: P404
  },
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/me',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true
    },
  },
  {
    path: '/add',
    name: 'Add',
    component: Add,
    meta: {
      requiresAuth: true
    },
  },
  {
    path: '/about',
    name: 'About',
    meta: {
      requiresAuth: true
    },
    component: About
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    //component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes,
  mode: 'history',
})

// router guards
router.beforeEach((to, from, next) => {
  // check to see if route has auth guard
  if(to.matched.some(rec => rec.meta.requiresAuth)){
    // check auth state of user
    let user = firebase.auth().currentUser
    if (user) {
      // User is signed in. Proceed to route
      next()
    } else {
      // No user is signed in. Redirect to login
      next({
        name: 'Login'
      })
    }
  } else {
    // if route is not guarded by auth, proceed
    next()
  }
})

export default router
