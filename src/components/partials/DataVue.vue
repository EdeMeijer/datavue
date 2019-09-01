<template>
  <div class="datavue">
    <span class="datavue-title">{{ title }}</span>
    <div class="datavue-wrapper">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      title: String
    }
  };
</script>
