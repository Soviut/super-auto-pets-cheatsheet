<template>
  <div class="flex flex-col min-h-screen">
    <header class="flex items-stretch gap-5 px-5 py-3 bg-gray-900">
      <router-link
        :to="{ name: 'home' }"
        class="flex items-center gap-3 text-white hover:no-underline"
      >
        <img src="@/assets/logo.svg" class="w-10 h-10" alt="LootSheet logo" />

        <span class="font-light text-xl"> LootSheet </span>
      </router-link>

      <nav class="flex items-stretch">
        <ul class="flex items-center">
          <li>
            <router-link
              :to="{ name: 'sheets' }"
              class="
                text-white
                font-light
                hover:text-primary-500 hover:no-underline
              "
            >
              Sheets
            </router-link>
          </li>
        </ul>
      </nav>
    </header>

    <main class="flex-grow bg-gray-200">
      <router-view />
    </main>

    <footer class="p-5 bg-gray-300 text-gray-500">&copy; 2021 LootSheet</footer>
  </div>
</template>
