<template>
  <header>
    <h1><router-link to="/" rel="home">CartoBio</router-link></h1>

    <nav class="main-navigation">
      <ul>
        <li><a href="#">Aide</a></li>
      </ul>
    </nav>
  </header>
</template>

<style lang="postcss" scoped>
header {
  background-color: #ccc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) / 2) var(--spacing);
}

header h1 {
  margin: 0;
}

header nav {

}

header nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

</style>
