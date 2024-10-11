<route lang="yaml">
meta:
  generalAudience: true
  seo:
    title: Plan du site
</route>

<template>
  <div class="fr-container fr-py-16v">
    <div class="fr-grid-row">
      <div class="fr-col-12 fr-col-md-8">
        <h1>Plan du site</h1>

        <section class="fr-py-6v">
          <ul>
            <li><router-link to="/">Accueil (grand public)</router-link></li>
            <li><router-link to="/pro">Accueil (professionnels)</router-link></li>
            <li>
              <router-link to="/login" aria-label="Se connecter au service CartoBio">Connexion</router-link> ou
              <router-link to="/logout" aria-label="Se déconnecter du service CartoBio">déconnexion</router-link>
            </li>
            <li><router-link to="/exploitations">Liste des exploitations</router-link></li>
            <li>
              Centre de support

              <ul>
                <li>
                  <a
                    href="https://docs-cartobio.agencebio.org/organisme-certification"
                    aria-label="Centre de support pour organisme de certification"
                    target="_blank"
                    rel="noopener"
                  >
                    Organisme de certification<lien-externe />
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs-cartobio.agencebio.org/agriculteurs.trices/"
                    aria-label="Centre de support pour agriculteur·ice"
                    target="_blank"
                    rel="noopener"
                  >
                    Agriculteur·ice<lien-externe />
                  </a>
                </li>
              </ul>
            </li>
            <li><router-link to="/projet">À propos</router-link></li>
            <li><router-link to="/accessibilite">Accessibilité</router-link></li>
            <li><router-link to="/mentions-legales">Mentions légales</router-link></li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>
