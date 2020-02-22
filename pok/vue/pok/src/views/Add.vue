<template>
  <div>
    <form action @submit.prevent="addNew()">
      <b-tabs pills card>
        <b-tab title="Where">
          <b-form-select
            v-model="where"
            :options="where_options"
            class="mb-3"
            value-field="item"
            text-field="name"
            disabled-field="notEnabled"
          ></b-form-select>
        </b-tab>

        <b-tab title="What">
          <div>
            <b-form-radio name="radio-size" size="lg">base2</b-form-radio>
            <b-form-radio name="radio-size" size="lg">base3</b-form-radio>
            <b-form-radio name="radio-size" size="lg">homerun</b-form-radio>
          </div>
        </b-tab>
        <b-tab title="How">
            <b-form-checkbox value="orange">sob</b-form-checkbox>
            <b-form-checkbox value="orange">dr</b-form-checkbox>
            <b-form-checkbox value="orange">tr</b-form-checkbox>
            <b-form-checkbox value="orange">rf</b-form-checkbox>
        </b-tab>
        <b-tab title="And">
          <b-form-group label="Extras">
            <b-form-checkbox value="orange">Orange</b-form-checkbox>
            <b-form-checkbox value="orange">blue</b-form-checkbox>
            <b-form-checkbox value="orange">black</b-form-checkbox>
          </b-form-group>
          <b-button type="submit" variant="success">Add</b-button>
        </b-tab>
      </b-tabs>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      where: '',
      where_options: ["bom dia", "depois"],
      what: '',
      how: '',
      and: []
    };
  },
  methods: {
      addNew() {
          alert('not yet implemented');
          this.$router.push({ name: "Dashboard" });
      }
  },
};
</script>

<style>
</style>