<route lang="yaml">
meta:
  generalAudience: true
  seo:
    title: Déclaration d'accessibilité du service en ligne
</route>

<template>
  <div class="fr-container fr-my-5w">
    <h1 class="fr-mb-1w">Déclaration d’accessibilité</h1>
    <p class="fr-hint-text">Publié le <span>20 juin 2022</span>, modifié le <span>02 avril 2025</span>.</p>

    <p>
      <span>L'Agence Bio</span> s’engage à rendre ses sites internet accessibles conformément à l’article 47 de la loi
      n° 2005-102 du 11 février 2005.
    </p>
    <p>À cette fin, ...</p>
    <p>La présente déclaration d’accessibilité s’applique au site <strong>CartoBio</strong>.</p>
    <h2>État de conformité</h2>
    <p>
      Le site <strong>CartoBio</strong> (https://cartobio.agencebio.org/) est
      <strong><span data-printfilter="lowercase">partiellement conforme</span></strong> avec le
      <a
        href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/methode-rgaa/criteres/#contenu"
        target="_blank"
        >référentiel général d’amélioration de l’accessibilité (<abbr
          title="Référentiel général d’amélioration de l’accessibilité"
          >RGAA</abbr
        >) version 4.1</a
      >, en raison des non-conformités énumérées dans la section « Résultats des tests ».
    </p>
    <h2>Résultats des tests</h2>
    <p>
      L’audit de conformité réalisé par la société Access42 révèle que le site est conforme à 51,56 % au RGAA version
      4.1.
    </p>
    <h3>Contenus inaccessibles</h3>
    <p>Les contenus listés ci-dessous ne sont pas accessibles pour les raisons suivantes.</p>
    <AccordionGroup class="fr-mb-3w">
      <AccordionSection title="Non-conformités">
        <ul>
          <li>[1.2] Des images de décoration ne sont pas ignorées des technologies d’assistance</li>
          <li>[3.1] Des informations sont véhiculées uniquement par la couleur</li>
          <li>[3.2]</li>
          <li>[3.3] Des textes et/ou des composants d’interfaces ont des contrastes insuffisants</li>
          <li>
            [4.8] Des contenus interactifs ou des composants présentant des informations n’ont pas d’alternatives
            accessibles
          </li>
          <li>
            [4.12 – 4.13] Des pages contiennent des contenus interactifs qui ne sont pas contrôlables au clavier et ne
            sont pas compatibles avec les technologies d’assistance
          </li>
          <li>[5.1] Des tableaux de données complexes n’ont pas de résumés</li>
          <li>[5.7] Des tableaux ont des cellules d’en-têtes définis</li>
          <li>[6.1] Des liens n’ont pas d’intitulés suffisamment explicites</li>
          <li>
            [7.1] Des fonctionnalités JavaScript ne sont pas compatibles avec les technologies d’assistance (notamment
            des fenêtres modales, des contenus qui s’affichent et se masquent), ou font un usage inapproprié de
            propriétés ARIA
          </li>
          <li>[7.4] Des changements de contexte se déclenchent sans que l’utilisateur en soit informé</li>
          <li>[7.5] Des messages de statut ne sont pas restitués par les technologies d’assistance</li>
          <li>
            [8.9] Des pages font usage de balises à des fins de présentation (par exemple des textes non structurés dans
            des balises de paragraphes)
          </li>
          <li>[9.1] Des pages ont une hiérarchie de titres non pertinente (titres manquants)</li>
          <li>[9.2 – 12.6] La structure et les zones principales des pages sont mal définies</li>
          <li>[9.3] Des suites d’éléments ne sont pas structurées correctement avec des listes</li>
          <li>[10.1] Des balises ou attributs HTML de présentation sont présents dans certaines pages</li>
          <li>
            [10.2] Des pages contiennent des informations insérées en CSS qui ne sont pas restituées par les
            technologies d’assistance
          </li>
          <li>[10.3] Des contenus ne se présentent pas dans un ordre logique dans le code source</li>
          <li>
            [10.4] Des pages présentent des pertes d’information et de lisibilité lorsqu’elles sont zoomées à 200%
          </li>
          <li>[10.7] Des indications visuelles de prise de focus ne sont pas suffisamment contrastées</li>
          <li>[10.11] Des contenus présentent des pertes d’informations lorsque les pages sont zoomées à 400%</li>
          <li>[11.1] Des champs de formulaires n’ont pas d’étiquette correctement liée</li>
          <li>[11.6] Les regroupements de champs de même nature n’ont pas de titres</li>
          <li>[11.9] Des boutons de formulaire ont un intitulé qui n’est pas pertinent</li>
          <li>
            [11.10 – 11.11] Des aides à la saisie et messages d’erreurs ne sont pas liés à leur champ respectif, ou des
            aides à la saisie sont absentes
          </li>
          <li>[12.2] Sur certaines pages, le menu de navigation n’est plus présent</li>
          <li>[12.3] Le plan du site n’est pas suffisamment pertinent</li>
        </ul>
      </AccordionSection>
      <AccordionSection title="Contenus non soumis à l’obligation d’accessibilité">
        <ul>
          <li>
            Les cartes interactives permettant de gérer (ajouter, modifier) les parcelles des exploitations sont
            développées avec <a href="https://www.openstreetmap.org/" target="_blank">Openstreetmap</a>
          </li>
          <li>L’information de la page « Les chiffres » est gérée via un module développé par Tableau public</li>
        </ul>
      </AccordionSection>
    </AccordionGroup>
    <h2>Établissement de cette déclaration d’accessibilité</h2>
    <p>Cette déclaration a été établie le 20/02/2025.</p>
    <AccordionGroup class="fr-mb-3w">
      <AccordionSection title="Technologies utilisées pour la réalisation du site"
        ><ul>
          <li>HTML5</li>
          <li>CSS</li>
          <li>JavaScript (Vue.js, core-js)</li>
        </ul></AccordionSection
      >
      <AccordionSection
        title="Agents utilisateurs, technologies d’assistance et outils utilisés pour vérifier l’accessibilité"
      >
        <p>
          Les tests des pages web ont été effectués avec les combinaisons de navigateurs web et lecteurs d’écran
          suivants&nbsp;:
        </p>
        <ul>
          <li>Firefox 135.0.1 et NVDA NVDA 2024.4.2</li>
          <li>Firefox 135.0.1 et JAWS JAWS 2024</li>
          <li>Safari 17.6 et VoiceOver (macOS 14.6.1)</li>
          <li>Safari et VoiceOver (iOS 17.1.1)</li>
          <li>Chrome et TalkBack (Android 14)</li>
        </ul>
        <p>
          La vérification de l’accessibilité est le résultat de tests manuels, assistés par des outils (feuilles CSS
          dédiées, extensions HeadingsMaps et WebDeveloper Toolbar, Color Contrast Analyser).
        </p></AccordionSection
      >
      <AccordionSection title="Pages du site ayant fait l’objet de la vérification de conformité"
        ><ul>
          <li><a href="/" target="_blank">Accueil</a></li>
          <li><a href="/mentions-legales" target="_blank">Mentions légales</a></li>
          <li><a href="/accessibilite" target="_blank">Accessibilité</a></li>
          <li><a href="/sitemap" target="_blank">Plan du site</a></li>
          <li><a href="/login" target="_blank">Authentification</a></li>
          <li><a href="/exploitations" target="_blank">Les chiffres</a></li>
          <li><a href="/exploitations/67602" target="_blank">Sélectionner mon exploitation</a></li>
          <li>
            <a href="/exploitations/67602" target="_blank"
              >Exploitations (Oui) - Choisir votre mode de création de parcellaire</a
            >
          </li>
          <li><a href="/exploitations/67382" target="_blank">Exploitations (Test)</a></li>
          <li>
            <a href="/exploitations/67382/1bfa66c3-f789-445d-9e2b-770a3ba26d5d" target="_blank"
              >Exploitations (Test) - Version créée le 29/01/2025</a
            >
          </li>
          <li>
            <a href="/exploitations/67382/1bfa66c3-f789-445d-9e2b-770a3ba26d5d/ajout-parcelle" target="_blank"
              >Ajout d’une parcelle</a
            >
          </li>
          <li>
            <a href="/exploitations/67382/1bfa66c3-f789-445d-9e2b-770a3ba26d5d/modifier/112723366049015" target="_blank"
              >Modification de parcelle</a
            >
          </li>
        </ul></AccordionSection
      >
    </AccordionGroup>
    <h2>Retour d’information et contact</h2>
    <p>Il est important de rappeler qu’en vertu de l’article 11 de la loi de février 2005&nbsp;:</p>
    <p>
      <i
        >« la personne handicapée a droit à la compensation des conséquences de son handicap, quels que soient l’origine
        et la nature de sa déficience, son âge ou son mode de vie. »</i
      >
    </p>

    <p>
      <strong>L'équipe CartoBio</strong> s'engage à prendre les moyens nécessaires afin de donner accès, dans un délai
      raisonnable, aux informations et fonctionnalités recherchées par la personne handicapée, que le contenu fasse
      l'objet d'une dérogation ou non.<br />
      <strong>L'équipe CartoBio</strong> invite les personnes qui rencontreraient des difficultés à la contacter via les
      informations ci-dessous afin qu’une assistance puisse être apportée (alternative accessible, information et
      contenu donnés sous une autre forme).
    </p>

    <ul class="basic-information feedback h-card">
      <li>E-mail&nbsp;: <a href="mailto:support-cartobio@agencebio.org">support-cartobio@agencebio.org</a></li>

      <li>
        Formulaire de contact&nbsp;:
        <a
          href="https://www.agencebio.org/pied-de-page/contact/"
          target="_blank"
          rel="noopener"
          title="Accéder a la page contact de l'Agence Bio"
          >https://www.agencebio.org/pied-de-page/contact/<lien-externe
        /></a>
      </li>
      <li>Adresse&nbsp;: <span>Agence Bio, 12, rue Henri Rol Tanguy, 93100 MONTREUIL</span></li>
      <li>
        Twitter&nbsp;:
        <a
          href="https://twitter.com/agence_bio"
          target="_blank"
          rel="noopener noreferrer"
          title="Accéder a la page twitter de l'Agence Bio"
          >@agence_bio<lien-externe
        /></a>
      </li>
    </ul>
    <h2>Voie de recours</h2>
    <p>
      Si vous constatez un défaut d'accessibilité vous empêchant d'accéder à un contenu ou une fonctionnalité du site,
      que vous nous le signalez et que vous ne parvenez pas à obtenir une réponse de notre part, vous êtes en droit de
      faire parvenir vos doléances ou une demande de saisine au Défenseur des droits.
    </p>
    <p>Plusieurs moyens sont à votre disposition&nbsp;:</p>
    <ul>
      <li>
        un
        <a href="https://formulaire.defenseurdesdroits.fr/formulaire_saisine/" target="_blank" rel="noopener"
          >formulaire de contact<lien-externe
        /></a>
      </li>
      <li>
        la
        <a href="https://www.defenseurdesdroits.fr/carte-des-delegues" target="_blank" rel="noopener"
          >liste du ou des délégués de votre région<lien-externe
        /></a>
        avec leurs informations de contact direct
      </li>
      <li>un numéro de téléphone : <a href="tel:0969390000">09 69 39 00 00</a></li>
      <li>
        une adresse postale (courrier gratuit, sans affranchissement)&nbsp;:<br />
        Le Défenseur des droits<br />
        Libre réponse 71120<br />
        75342 Paris CEDEX 07
      </li>
    </ul>
  </div>
</template>

<script setup>
import AccordionGroup from "@/components/widgets/AccordionGroup.vue";
import AccordionSection from "@/components/widgets/Accordion.vue";
</script>
