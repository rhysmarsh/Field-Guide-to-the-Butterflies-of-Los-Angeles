import { useState, useMemo, useCallback, useEffect } from "react";

const FAMILIES = {
  papilionidae: { name: "Papilionidae", common: "Swallowtails", color: "#D4A843", icon: "◆" },
  pieridae: { name: "Pieridae", common: "Whites & Sulphurs", color: "#C4B44E", icon: "○" },
  lycaenidae: { name: "Lycaenidae", common: "Blues, Coppers & Hairstreaks", color: "#5B7FB8", icon: "◇" },
  nymphalidae: { name: "Nymphalidae", common: "Brushfoots", color: "#C05A30", icon: "◈" },
  hesperiidae: { name: "Hesperiidae", common: "Skippers", color: "#8B7355", icon: "▸" },
  riodinidae: { name: "Riodinidae", common: "Metalmarks", color: "#A0522D", icon: "✦" },
};

const STATUS_COLORS = { common: "#4A7C59", uncommon: "#B08B20", rare: "#C44536", endangered: "#8B0000", vagrant: "#7070A0", extirpated: "#666", historical: "#999" };
const STATUS_LABELS = { common: "Common", uncommon: "Uncommon", rare: "Rare", endangered: "Federally Endangered", vagrant: "Vagrant / Irregular", extirpated: "Extirpated", historical: "Historic Only" };

const ZONE_NAMES = ["Santa Monica Mtns", "San Gabriel Mtns", "Coastal / Urban Basin", "Palos Verdes Peninsula", "Antelope Valley / Desert", "Santa Clarita / N. Foothills", "Puente / Chino Hills"];

// Comprehensive LA County butterfly species list (~148 species)
// Includes: resident, rare, vagrant/irregular, extirpated, and historic-only records
// Zones: 0=SantaMonica, 1=SanGabriel, 2=Coastal/Urban, 3=PalosVerdes, 4=AntelopeValley, 5=SantaClarita, 6=Puente/Chino
const B = (id,name,sci,fam,st,ws,fl,host,hab,zones,notes) => ({id,name,scientific:sci,family:fam,status:st,wingspan:ws,flight:fl,hostPlants:host,habitat:hab,zones,notes});

const BUTTERFLIES = [
  // PAPILIONIDAE (7)
  B(1,"Western Tiger Swallowtail","Papilio rutulus","papilionidae","common","2.8–4.0″","Mar–Sep","Willows, sycamore, cottonwood, alder","Riparian corridors, wooded canyons, suburban gardens",[0,1,2,5,6],"Most conspicuous large butterfly in LA County. Males hilltop and patrol streams. Frequently puddling at wet gravel in mountain canyons."),
  B(2,"Pale Swallowtail","Papilio eurymedon","papilionidae","uncommon","2.5–3.5″","Apr–Jul","Ceanothus, coffeeberry, buckbrush","Chaparral slopes, montane canyons, oak woodland edges",[0,1,5,6],"Cream-white with bold black stripes. Favors higher elevations. Active hilltopper on ridgelines."),
  B(3,"Anise Swallowtail","Papilio zelicaon","papilionidae","common","2.5–3.5″","Feb–Oct","Sweet fennel, lomatium, parsley family","Open hillsides, disturbed lots, gardens",[0,1,2,5,6],"Yellow-black with blue hindwing spots. Lays on cultivated fennel and parsley. Multiple broods."),
  B(4,"Pipevine Swallowtail","Battus philenor","papilionidae","rare","2.8–3.5″","Mar–Sep","California pipevine (Aristolochia californica)","Riparian areas with pipevine",[0,1,5],"Iridescent blue-black. Range limited by host plant. Toxic alkaloids make adults unpalatable; several species mimic them."),
  B(5,"Western Giant Swallowtail","Papilio rumiko","papilionidae","common","3.5–5.5″","May–Oct","Citrus, rue, hop tree","Citrus orchards, suburban gardens",[2,5,6],"Split from P. cresphontes in 2014. The western species is now common in LA County, breeding on citrus and rue in suburban gardens. One of the largest butterflies in the region."),
  B(6,"Indra Swallowtail","Papilio indra","papilionidae","rare","2.5–3.2″","Apr–Jun","Lomatium, cymopterus (desert parsley)","Rocky canyon walls, desert edges",[1,4],"Short-tailed dark swallowtail of arid rocky habitats. Localized in San Gabriels and desert transition. One brood."),
  B(7,"Two-tailed Swallowtail","Papilio multicaudata","papilionidae","vagrant","3.5–5.0″","May–Aug","Chokecherry, ash","Foothill canyons, riparian woodland",[1,5],"Occasional visitor from eastern ranges. Distinguished from Tiger Swallowtail by two tails per hindwing and larger size."),

  // PIERIDAE (18)
  B(8,"Cabbage White","Pieris rapae","pieridae","common","1.5–2.0″","Year-round","Mustards, broccoli, cabbage, nasturtium","Ubiquitous — gardens, fields, urban areas",[0,1,2,3,4,5,6],"Non-native from Europe (~1860s). Most commonly seen butterfly in LA County year-round. Absent only from highest peaks."),
  B(9,"Checkered White","Pontia protodice","pieridae","uncommon","1.3–1.8″","Mar–Nov","Wild mustards, peppergrass","Open disturbed areas, agricultural edges, desert",[2,4,5],"Checkered dark markings on forewings. More common in drier habitats and Antelope Valley."),
  B(10,"Spring White","Pontia sisymbrii","pieridae","uncommon","1.3–1.6″","Mar–May","Rock cress, jewel flower","Chaparral, foothill canyons, mountain slopes",[0,1,5],"Early spring flier. Green marbling on underside of hindwing. One brood; flies with Sara Orangetip."),
  B(11,"Becker's White","Pontia beckerii","pieridae","uncommon","1.5–2.0″","Mar–Sep","Bladderpod, mustards","Desert scrub, washes, arid rocky slopes",[4,5],"Primarily desert species reaching county in Antelope Valley and arid foothills. Green veining on ventral hindwing."),
  B(12,"Cloudless Sulphur","Phoebis sennae","pieridae","common","2.2–2.8″","Year-round","Cassia, senna species","Gardens, parks, open areas",[0,2,3,5,6],"Large brilliant lemon-yellow. Increasingly common in urban LA with ornamental senna plantings. Strong direct flight."),
  B(13,"Orange Sulphur","Colias eurytheme","pieridae","common","1.5–2.3″","Year-round","Alfalfa, clovers, vetches","Agricultural fields, lawns, roadsides",[0,2,3,4,5,6],"'Alfalfa Butterfly.' Orange with black border. Hybridizes with Clouded Sulphur. Common across all open habitats."),
  B(14,"Clouded Sulphur","Colias philodice","pieridae","uncommon","1.5–2.0″","Mar–Nov","Clovers, alfalfa, vetches","Fields, meadows, agricultural areas",[2,4,5],"Yellow (not orange) with black borders. Hybridizes frequently with Orange Sulphur, producing intermediates."),
  B(15,"California Dogface","Zerene eurydice","pieridae","uncommon","2.0–2.5″","Apr–Sep","False indigo (Amorpha californica)","Foothill chaparral, oak woodland, riparian",[0,1,5,6],"California's state insect. Males show 'dog face' in yellow/black. Fast-flying, difficult to approach. Foothill specialist."),
  B(16,"Sara Orangetip","Anthocharis sara","pieridae","uncommon","1.2–1.8″","Feb–May","Rock cress, jewel flower, wild mustards","Chaparral, coastal scrub, foothill canyons",[0,1,5,6],"Spring specialist — one of the first butterflies to fly. Males have brilliant orange wingtips. One brood per year."),
  B(17,"Desert Orangetip","Anthocharis cethura","pieridae","uncommon","1.2–1.6″","Feb–Apr","Bladderpod, desert mustards","Desert washes, arid scrub, rocky slopes",[4,5],"Desert counterpart to Sara Orangetip. Yellow tips (not orange) in some forms. Very early spring flier."),
  B(18,"Dainty Sulphur","Nathalis iole","pieridae","uncommon","0.7–1.0″","Mar–Nov","Marigolds, bidens, composites","Open areas, roadsides, gardens",[2,4,5],"Smallest sulphur in North America. Low fluttering flight close to ground. Easily overlooked."),
  B(19,"Sleepy Orange","Eurema nicippe","pieridae","uncommon","1.3–2.0″","Year-round","Cassia, senna","Open areas, roadsides, desert edges",[2,4,5],"Bright orange above with black borders. Expanding northward into LA. Winter form has reddish-brown underside."),
  B(20,"Mexican Yellow","Eurema mexicana","pieridae","vagrant","1.5–2.2″","Jul–Oct","Cassia, senna, acacias","Open areas, washes, riparian edges",[4,5],"Summer-fall vagrant from desert and Mexican ranges. 'Dog face' pattern on upperwing less pronounced than Dogface."),
  B(21,"Southern Dogface","Zerene cesonia","pieridae","rare","2.0–2.5″","May–Oct","False indigo, clovers, leadplant","Open areas, desert edges, scrubland",[4,5],"Distinguished from California Dogface by pointed forewing and wider distribution. Primarily desert-edge species in LA County."),
  B(22,"Large Orange Sulphur","Phoebis agarithe","pieridae","rare","2.5–3.2″","Year-round","Pithecellobium, acacias","Gardens, parks, desert washes",[2,4],"Rare stray. Deep orange with faint markings. Can be confused with Cloudless Sulphur but darker orange."),
  B(23,"Harford's Sulphur","Colias harfordii","pieridae","uncommon","1.3–1.8″","May–Aug","Rattleweed (Astragalus spp.)","Mountain meadows, montane scrub",[1],"San Gabriel Mountains specialist. Bright yellow with strong black borders. One brood at elevation."),
  B(24,"Pine White","Neophasia menapia","pieridae","rare","1.5–2.0″","Jul–Sep","Pines, Douglas-fir","Coniferous forest at elevation",[1],"Found in pine forests of upper San Gabriels. Slow, floating flight high in tree canopy. Can irrupt in some years."),
  B(25,"Pearly Marblewing","Euchloe hyantis","pieridae","uncommon","1.3–1.6″","Mar–May","Rock cress, jewel flower","Chaparral, rocky slopes, foothill canyons",[0,1,5],"Green marbling on underside. Spring specialist. Flies close to ground among blooming mustards in chaparral."),

  // LYCAENIDAE (30)
  B(26,"Gray Hairstreak","Strymon melinus","lycaenidae","common","1.0–1.4″","Year-round","Wide range: mallows, legumes, buckwheat","Gardens, chaparral, disturbed areas",[0,1,2,3,5,6],"Most widespread hairstreak. Thin tail and orange-capped eyespot on hindwing. Extreme generalist."),
  B(27,"Hedgerow Hairstreak","Satyrium saepium","lycaenidae","uncommon","1.0–1.3″","May–Jul","Ceanothus species","Chaparral, coastal sage scrub, mountain slopes",[0,1,5,6],"Warm brown with thin white postmedian line. Tied to Ceanothus. One brood, timed with bloom."),
  B(28,"California Hairstreak","Satyrium californica","lycaenidae","uncommon","1.0–1.3″","May–Jul","Oaks, ceanothus, mountain mahogany","Oak-chaparral interface, foothill canyons",[0,1,5,6],"Brown with orange lunules near tail. Single brood in late spring. Foothill/mountain species."),
  B(29,"Gold-hunter's Hairstreak","Satyrium auretorum","lycaenidae","rare","1.0–1.3″","May–Jul","Oaks (Quercus spp.)","Oak woodland, foothill canyons",[0,1,5],"Closely tied to interior live oak. Warm golden-brown underside. Very local; requires intact oak stands."),
  B(30,"Mountain Mahogany Hairstreak","Satyrium tetra","lycaenidae","rare","1.0–1.3″","Jun–Jul","Mountain mahogany (Cercocarpus)","Rocky chaparral, mountain slopes",[1,5],"Specialist on mountain mahogany. Gray-brown with reduced markings. San Gabriel Mountains."),
  B(31,"Great Purple Hairstreak","Atlides halesus","lycaenidae","rare","1.2–1.8″","Feb–Oct","Mistletoe (Phoradendron spp.)","Oak woodlands with mistletoe",[0,1,5],"Stunning iridescent blue-purple dorsally. Feeds exclusively on mistletoe. Uncommon but unmistakable."),
  B(32,"Brown Elfin","Callophrys augustinus","lycaenidae","uncommon","0.9–1.1″","Mar–May","Ceanothus, manzanita, salal","Chaparral, coastal scrub",[0,1,5],"Dark reddish-brown. One of the earliest spring butterflies. Sits with wings closed showing cryptic underside."),
  B(33,"Moss's Elfin","Callophrys mossii","lycaenidae","rare","0.8–1.0″","Mar–May","Stonecrop (Sedum/Dudleya)","Rocky outcrops, cliff faces in chaparral",[0,1],"Specialist on succulent stonecrop. Local populations on rocky outcrops. San Gabriel subspecies 'hidakupa' described from the range."),
  B(34,"Bramble Hairstreak","Callophrys dumetorum","lycaenidae","uncommon","0.9–1.1″","Mar–May","Buckwheat (Eriogonum fasciculatum)","Coastal sage scrub, chaparral",[0,1,5,6],"Brilliant green underside camouflages on buckwheat. One spring brood. Indicator of intact scrub."),
  B(35,"Thicket Hairstreak","Callophrys spinetorum","lycaenidae","rare","0.9–1.2″","May–Jul","Dwarf mistletoe (Arceuthobium)","Coniferous forests at elevation",[1],"Dark blue-purple. Specialist on dwarf mistletoe in conifer forests. Higher-elevation San Gabriels only."),
  B(36,"Western Pygmy-Blue","Brephidium exilis","lycaenidae","common","0.5–0.75″","Year-round","Saltbush, pickleweed, lamb's-ear","Coastal salt marsh, alkali flats, disturbed areas",[2,3,4],"Smallest butterfly in North America. Easily overlooked. Favors saline/alkaline habitats."),
  B(37,"Marine Blue","Leptotes marina","lycaenidae","common","0.8–1.1″","Year-round","Leadwort, alfalfa, milkvetch","Gardens, urban areas, open fields",[0,2,3,5,6],"Most common blue in residential LA. Striped brown-and-white underside. Feeds on ornamental plumbago."),
  B(38,"Western Tailed-Blue","Cupido amyntula","lycaenidae","uncommon","0.8–1.1″","Apr–Aug","Vetches, legumes, lotus","Mountain meadows, riparian edges",[1,5],"Small delicate tail on hindwing. More common at elevation in San Gabriels."),
  B(39,"Spring Azure","Celastrina ladon","lycaenidae","uncommon","0.8–1.1″","Mar–Jun","Ceanothus, dogwood, meadowsweet","Woodland edges, chaparral, riparian",[0,1,5],"Pale silvery-blue. One of the earliest spring blues. Multiple host plant families."),
  B(40,"Echo Azure","Celastrina echo","lycaenidae","uncommon","0.8–1.1″","Feb–Jul","Ceanothus, redberry","Chaparral, foothill woodland",[0,1,5,6],"Western counterpart to Spring Azure (sometimes considered same species). Pale blue, white underside with dark spots."),
  B(41,"Acmon Blue","Icaricia acmon","lycaenidae","common","0.8–1.1″","Mar–Oct","Buckwheat, lupines, lotus, deerweed","Coastal scrub, chaparral, open hillsides",[0,1,2,3,5,6],"Males bright blue with orange marginal band. Common wherever buckwheat grows. Key pollinator of sage scrub."),
  B(42,"Lupine Blue","Icaricia lupini","lycaenidae","uncommon","0.8–1.1″","May–Aug","Lupines, buckwheat","Mountain meadows, pine-oak woodland",[1,5],"Very similar to Acmon Blue. Distinguished by habitat (higher elevation) and subtle ventral markings."),
  B(43,"Silvery Blue","Glaucopsyche lygdamus","lycaenidae","uncommon","0.9–1.2″","Mar–Jun","Lupines, vetches, lotus","Foothill canyons, oak woodland edges",[0,1,5,6],"Parent species of the Palos Verdes Blue. Silvery blue dorsally, gray with black spots ventrally. One spring brood."),
  B(44,"El Segundo Blue","Euphilotes allyni","lycaenidae","endangered","0.75–1.0″","Jun–Aug","Seacliff buckwheat (Eriogonum parvifolium)","Coastal dune remnants near LAX",[2],"FEDERALLY ENDANGERED (1976). Restricted to remnant coastal dunes near LAX. Dedicated preserve adjacent to runways. Adults live only 4–14 days. Critically imperiled."),
  B(45,"Palos Verdes Blue","Glaucopsyche lygdamus palosverdesensis","lycaenidae","endangered","0.8–1.1″","Feb–May","Southern CA locoweed, deerweed","Coastal sage scrub, Palos Verdes Peninsula",[3],"FEDERALLY ENDANGERED (1980). Thought extinct until 1994 rediscovery. Captive breeding by Moorpark College/USFWS. Found only on PV Peninsula in tiny scrub fragments."),
  B(46,"Bernardino Blue","Euphilotes bernardino","lycaenidae","uncommon","0.8–1.0″","Apr–Oct","Buckwheat (Eriogonum spp.)","Coastal scrub, chaparral, sand dunes",[0,2,5],"Related to El Segundo Blue but more widespread. Multiple broods tied to buckwheat flowering."),
  B(47,"Square-spotted Blue","Euphilotes battoides","lycaenidae","uncommon","0.8–1.0″","May–Aug","Buckwheat (Eriogonum spp.)","Chaparral, rocky slopes, mountain scrub",[1,5],"Bright blue with squared orange spots. Tied to buckwheat at higher elevations."),
  B(48,"Ceraunus Blue","Hemiargus ceraunus","lycaenidae","rare","0.8–1.1″","Year-round","Partridge pea, mesquite, acacias","Desert scrub, washes, disturbed areas",[4],"Primarily desert species. Small blue with a distinctive dark spot and orange eyespot on ventral hindwing."),
  B(49,"Reakirt's Blue","Echinargus isola","lycaenidae","rare","0.8–1.1″","Apr–Oct","Mesquite, acacias, legumes","Desert edges, washes, open scrub",[4,5],"Row of postmedian dark spots on ventral forewing. Desert-edge species, seasonal stray into basin."),
  B(50,"Hermes Copper","Lycaena hermes","lycaenidae","rare","1.0–1.3″","May–Jul","Spiny redberry (Rhamnus crocea)","Coastal sage scrub with mature redberry",[0],"Southern CA endemic. Yellow-brown with dark spots. Range contracting. At northern edge in Santa Monicas."),
  B(51,"Purplish Copper","Lycaena helloides","lycaenidae","uncommon","1.0–1.3″","Apr–Oct","Docks, sorrel, knotweed","Moist meadows, streamsides, disturbed areas",[0,1,2,5],"Males purplish dorsally with orange zigzag. Found near water with dock plants. Multiple broods."),
  B(52,"Gorgon Copper","Lycaena gorgon","lycaenidae","uncommon","1.0–1.4″","May–Jul","Buckwheat (Eriogonum fasciculatum)","Chaparral, coastal sage scrub",[0,1,5,6],"Large for a copper. Males dark brown-purple; females orange-spotted. Tied to buckwheat."),
  B(53,"Blue Copper","Lycaena heteronea","lycaenidae","rare","1.0–1.4″","Jun–Aug","Buckwheat (Eriogonum spp.)","Mountain chaparral, rocky slopes",[1],"Males brilliant blue (unusual for coppers). Higher San Gabriels. Flies with buckwheat blues."),
  B(54,"Behr's Metalmark","Apodemia virgulti","lycaenidae","uncommon","0.9–1.2″","Apr–Oct","Buckwheat (Eriogonum fasciculatum)","Coastal sage scrub, chaparral openings",[0,1,5,6],"Orange-brown with white spots. Two or more broods. Actually a Riodinidae — often placed there."),
  B(55,"Sonoran Blue","Philotes sonorensis","lycaenidae","rare","0.7–0.9″","Feb–Apr","Stonecrop (Dudleya spp.)","Rocky outcrops, canyon walls",[0,1,5],"Tiny early-spring blue. Specialist on Dudleya succulents on rocky faces. Brilliant blue with orange spots below."),

  // NYMPHALIDAE (40)
  B(56,"Monarch","Danaus plexippus","nymphalidae","uncommon","3.5–4.0″","Year-round","Milkweeds (Asclepias spp.)","Gardens, fields, coastal groves",[0,2,3,5],"Iconic migratory species. Western population overwinters on CA coast. Candidate for listing; steep population decline."),
  B(57,"Queen","Danaus gilippus","nymphalidae","rare","3.0–3.5″","May–Oct","Milkweeds, milkvine","Desert edges, open scrub, washes",[4],"Darker reddish-brown Monarch relative. Primarily desert species. Seasonal stray into Antelope Valley."),
  B(58,"Gulf Fritillary","Agraulis vanillae","nymphalidae","common","2.5–3.5″","Year-round","Passion vine (Passiflora spp.)","Gardens, parks, urban areas",[0,2,3,5,6],"Bright orange with silver-spangled underside. Most striking garden butterfly. Thrives on ornamental passionflower."),
  B(59,"Variegated Fritillary","Euptoieta claudia","nymphalidae","rare","1.8–2.5″","May–Oct","Violets, passion vine, plantains","Open fields, desert edges",[4,5],"Tawny-orange with complex mottled pattern. Lacks silver underside of Gulf Fritillary. Occasional in northern county."),
  B(60,"Painted Lady","Vanessa cardui","nymphalidae","common","2.0–2.5″","Year-round","Thistles, mallows, boraginaceae","Open areas everywhere",[0,1,2,3,4,5,6],"World's most widespread butterfly. Massive irruptions from desert in good rain years produce millions. Hugely variable year to year."),
  B(61,"West Coast Lady","Vanessa annabella","nymphalidae","common","1.8–2.2″","Year-round","Mallows, cheeseweed","Urban areas, gardens, chaparral edges",[0,1,2,3,5,6],"Orange forewing bar (not white like Painted Lady). Abundant in urban LA on weedy mallows."),
  B(62,"Red Admiral","Vanessa atalanta","nymphalidae","common","1.75–2.5″","Year-round","Stinging nettle (Urtica spp.)","Moist woodland edges, riparian, shaded gardens",[0,1,2,5,6],"Dark with bold red-orange bands. Attracted to fermenting fruit and sap. Highly territorial males."),
  B(63,"American Lady","Vanessa virginiensis","nymphalidae","uncommon","1.75–2.5″","Mar–Nov","Cudweed, everlasting, pussytoes","Open areas, chaparral clearings, coastal scrub",[0,2,5],"Two large eyespots on ventral hindwing (vs. four in Painted Lady). Less common, more habitat-specific."),
  B(64,"Mourning Cloak","Nymphalis antiopa","nymphalidae","common","3.0–4.0″","Year-round","Willows, elms, cottonwood, hackberry","Riparian corridors, wooded canyons",[0,1,2,5,6],"Adults overwinter — live 10+ months. Dark maroon with cream border. Among first butterflies seen in spring."),
  B(65,"California Tortoiseshell","Nymphalis californica","nymphalidae","rare","2.0–2.8″","May–Sep","Ceanothus species","Mountain chaparral, mixed forest",[1],"Brilliant orange with dark borders. Irruptive — can be locally abundant in San Gabriels after good Ceanothus years, absent otherwise."),
  B(66,"Milbert's Tortoiseshell","Nymphalis milberti","nymphalidae","rare","1.8–2.2″","May–Sep","Stinging nettle","Moist mountain meadows, streamsides",[1],"Dark with orange-yellow submarginal band. Rare in LA County; mountain species at elevation."),
  B(67,"Satyr Comma","Polygonia satyrus","nymphalidae","uncommon","1.8–2.2″","May–Sep","Stinging nettle","Riparian woodland, mountain streamsides",[1,5],"Ragged wing edges and bark-like underside. Silver comma on underside. Primarily montane."),
  B(68,"Hoary Comma","Polygonia gracilis","nymphalidae","rare","1.7–2.0″","Jun–Sep","Currants, gooseberries","Mountain forest, rocky streamsides",[1],"Higher-elevation comma butterfly. Darker than Satyr Comma with hoary gray underside. San Gabriel Mtns only."),
  B(69,"California Sister","Adelpha californica","nymphalidae","uncommon","2.5–3.5″","May–Sep","Coast live oak (Quercus agrifolia)","Oak woodlands, shaded canyons",[0,1,5,6],"Orange-and-white bands on black. Strongly tied to live oaks. Gliding flight. CA endemic."),
  B(70,"Lorquin's Admiral","Limenitis lorquini","nymphalidae","uncommon","2.0–2.8″","Apr–Sep","Willows, cottonwood, chokecherry","Riparian corridors, streamsides",[0,1,5,6],"Orange wingtips. Batesian mimic of toxic California Sister. Requires healthy riparian habitat."),
  B(71,"Common Buckeye","Junonia coenia","nymphalidae","common","2.0–2.5″","Year-round","Plantains, snapdragons, monkey flower","Open areas, fields, roadsides",[0,2,3,4,5,6],"Four prominent eyespots. Basks wings-open on bare ground. Highly adaptable."),
  B(72,"Variable Checkerspot","Euphydryas chalcedona","nymphalidae","uncommon","1.5–2.2″","Mar–Jun","Sticky monkey flower, Indian paintbrush","Chaparral, coastal scrub, foothill slopes",[0,1,5,6],"Highly variable — black/red/yellow-cream. Colonies locally abundant after rain. Gregarious larvae."),
  B(73,"Edith's Checkerspot","Euphydryas editha","nymphalidae","rare","1.3–1.8″","Mar–May","Plantain, owl's clover, paintbrush","Grasslands, open chaparral",[0,1,5],"Small checkerspot with very local colonies. Sensitive to drought and habitat loss. Multiple subspecies in SoCal."),
  B(74,"Quino Checkerspot","Euphydryas editha quino","nymphalidae","endangered","1.3–1.8″","Feb–Apr","Dwarf plantain, purple owl's clover","Coastal sage scrub openings",[6],"FEDERALLY ENDANGERED. Historically more widespread in SoCal. Small remnant populations. Captive-reared by San Diego Zoo."),
  B(75,"Gabb's Checkerspot","Chlosyne gabbii","nymphalidae","rare","1.3–1.8″","Apr–Jun","Hazardia, goldenbush","Coastal sage scrub, arid scrublands",[0,5],"Red-orange and black. Localized colonies in intact sage scrub. Sensitive to fragmentation and drought."),
  B(76,"Leanira Checkerspot","Chlosyne leanira","nymphalidae","uncommon","1.3–1.8″","Apr–Jun","Indian paintbrush (Castilleja)","Rocky chaparral, canyon walls",[0,1,5],"Dark checkerspot with cream bands. Specialist on paintbrush. Multiple subspecies including 'wrightii' in SoCal."),
  B(77,"Northern Checkerspot","Chlosyne palla","nymphalidae","rare","1.3–1.8″","May–Jul","Asters, goldfields","Mountain meadows, open forest",[1],"At southern edge of range in San Gabriel Mountains. Orange with complex black patterning."),
  B(78,"Tiny Checkerspot","Dymasia dymas","nymphalidae","rare","0.9–1.3″","Mar–Oct","Desert fiddleneck, asters","Desert scrub, washes, rocky slopes",[4],"Very small. Desert species reaching LA County in Antelope Valley. Orange-brown with fine black lines."),
  B(79,"Mylitta Crescent","Phyciodes mylitta","nymphalidae","common","1.0–1.5″","Mar–Oct","Thistles (Cirsium spp.)","Disturbed areas, roadsides, streamsides",[0,1,2,5,6],"Small orange-and-black. Common wherever thistles grow. Multiple broods."),
  B(80,"Painted Crescent","Phyciodes picta","nymphalidae","rare","1.0–1.3″","Apr–Sep","Asters","Open areas, desert scrub edges",[4],"Primarily desert species in LA County's Antelope Valley. Delicate orange-and-black pattern."),
  B(81,"Common Ringlet","Coenonympha tullia","nymphalidae","uncommon","1.2–1.6″","May–Aug","Native grasses","Grassy meadows, foothill grasslands",[0,1,5],"Soft tawny-brown with small eyespot. Bouncing flight over grasslands. More common in foothill/mountain meadows."),
  B(82,"Great Basin Wood-Nymph","Cercyonis sthenele","nymphalidae","uncommon","1.8–2.2″","Jun–Sep","Native grasses (Stipa, Elymus)","Oak woodland, chaparral edges, grassy slopes",[0,1,5,6],"Two eyespots on forewing. Slow bobbing flight in dry grassy areas. Indicator of native grassland."),
  B(83,"Small Wood-Nymph","Cercyonis oetus","nymphalidae","rare","1.4–1.8″","Jun–Aug","Native grasses","Mountain meadows, open pine woodland",[1],"Smaller than Great Basin Wood-Nymph. Higher-elevation grassland species. Single forewing eyespot."),
  B(84,"Common Buckeye (Dark Form)","Junonia coenia","nymphalidae","uncommon","2.0–2.5″","Oct–Mar","Plantains, snapdragons","Open areas, fields",[0,2,3,5],"Late-season dark morph of Common Buckeye, sometimes treated separately. Deeply suffused reddish-brown dorsally. Winters in coastal LA. Illustrates seasonal polyphenism in butterflies."),
  B(85,"Empress Leilia","Asterocampa leilia","nymphalidae","vagrant","1.8–2.5″","May–Oct","Hackberry (Celtis spp.)","Riparian areas with hackberry",[4,5],"Desert species occasionally reaching LA County. Pale gray-brown with small eyespots. Rarely confirmed."),
  B(86,"Hackberry Emperor","Asterocampa celtis","nymphalidae","vagrant","1.5–2.3″","May–Sep","Hackberry (Celtis spp.)","Riparian woodland, parks with hackberry",[5],"Extremely rare in LA County. Warm brown with dark eyespots and white forewing spots."),
  B(87,"California Ringlet","Coenonympha california","nymphalidae","uncommon","1.2–1.5″","May–Jul","Grasses","Coastal bluffs, grasslands, chaparral openings",[0,5],"Pale straw-colored. More coastal than interior ringlets. Soft bouncing flight over grasslands."),
  B(88,"Unsilvered Fritillary","Speyeria adiaste","nymphalidae","extirpated","2.0–2.5″","Jun–Aug","Violets","Mountain meadows, open forest",[1],"EXTIRPATED. Formerly recorded from San Gabriel Mountains. Not reliably documented in county for decades. Habitat degradation and drought likely causes."),
  B(89,"Callippe Silverspot","Speyeria callippe","nymphalidae","historical","2.0–2.5″","May–Jul","Violets (Viola spp.)","Mountain meadows, grassland-chaparral mosaic",[1],"HISTORIC ONLY. Reported from San Gabriel Mountains but no confirmed recent records. Likely represents old misidentifications or a population lost decades ago. Large fritillary with silver spots ventrally."),
  B(90,"Mormon Fritillary","Speyeria mormonia","nymphalidae","rare","1.5–2.2″","Jun–Sep","Violets","Mountain meadows at elevation",[1],"Smallest Speyeria. Higher-elevation San Gabriel Mountains. One brood in summer."),
  B(91,"Tropical Buckeye","Junonia zonalis","nymphalidae","vagrant","2.0–2.5″","Jun–Oct","Acanthaceae","Urban areas, gardens",[2],"VAGRANT. Occasional records from LA basin, likely confused with Common Buckeye. Darker overall with more extensive dark banding around eyespots. Taxonomy debated."),

  // HESPERIIDAE (22)
  B(93,"Fiery Skipper","Hylephila phyleus","hesperiidae","common","1.0–1.3″","Year-round","Bermuda grass, lawn grasses","Lawns, gardens, parks",[0,2,3,5,6],"Most common skipper in urban LA. Males bright orange-gold. Thrives on mowed lawns."),
  B(94,"Umber Skipper","Paratrytone melane","hesperiidae","common","1.1–1.4″","Year-round","Grasses, native bunch grasses","Shaded gardens, woodland edges",[0,1,2,5,6],"Dark brown with warm orange patches. Shade-tolerant. Common in gardens with native grasses."),
  B(95,"Funereal Duskywing","Erynnis funeralis","hesperiidae","common","1.2–1.6″","Mar–Oct","Deerweed, lotus, vetch","Open scrub, roadsides",[0,1,2,5,6],"Dark brown-black with white hindwing fringe. Strong, darting flight. Common and widespread."),
  B(96,"Mournful Duskywing","Erynnis tristis","hesperiidae","uncommon","1.2–1.6″","Mar–Sep","Oaks (Quercus spp.)","Oak woodlands, shaded canyons",[0,1,5,6],"Associated with oaks. Indicator of healthy oak woodland. Darker than Funereal with less white."),
  B(97,"Propertius Duskywing","Erynnis propertius","hesperiidae","uncommon","1.2–1.6″","Mar–Jun","Oaks (Quercus spp.)","Oak woodland, chaparral edges",[0,1,5],"Gray-brown duskywing. One brood in spring. More common in coast live oak habitat."),
  B(98,"Pacuvius Duskywing","Erynnis pacuvius","hesperiidae","uncommon","1.1–1.4″","Apr–Jul","Ceanothus species","Chaparral, mountain slopes",[0,1,5],"Specialist on Ceanothus. Brown with gray overscaling. Flies in chaparral with its host plant."),
  B(99,"Sleepy Duskywing","Erynnis brizo","hesperiidae","uncommon","1.2–1.5″","Mar–May","Oaks (Quercus spp.)","Oak woodland, chaparral",[0,1,5,6],"Early-spring oak-feeder. Gray-brown, lacks white hindwing fringe of Funereal Duskywing."),
  B(100,"Common Checkered-Skipper","Burnsius communis","hesperiidae","common","0.75–1.25″","Year-round","Mallows, globe mallow","Disturbed areas, gardens, fields",[0,2,3,4,5,6],"Black-and-white checkerboard. Males bluish-white haired. Extremely alert and jumpy."),
  B(101,"Northern White-Skipper","Heliopetes ericetorum","hesperiidae","uncommon","1.0–1.5″","Apr–Sep","Mallows, globe mallow","Open scrub, desert edges",[4,5],"Predominantly white with dark markings. Drier northern areas and Antelope Valley."),
  B(102,"Common Sootywing","Pholisora catullus","hesperiidae","uncommon","0.8–1.1″","Mar–Oct","Lamb's quarters, amaranth","Disturbed areas, gardens, vacant lots",[2,4,5],"Very dark — nearly black with white spots. Low flight close to ground. Weedy urban habitats."),
  B(103,"Wandering Skipper","Panoquina errans","hesperiidae","rare","1.0–1.4″","Jun–Oct","Salt grass (Distichlis spicata)","Coastal salt marshes, tidal flats",[2,3],"Sensitive species tied to vanishing coastal marshes. Documented at Malibu Lagoon. Loss of salt marsh habitat is critical threat."),
  B(104,"Woodland Skipper","Ochlodes sylvanoides","hesperiidae","common","1.0–1.3″","Jul–Oct","Native grasses","Open woodland, chaparral edges, gardens",[0,1,2,5,6],"Late-summer/fall skipper. Warm orange-brown. Common in foothill oak woodland and suburban gardens."),
  B(105,"Rural Skipper","Ochlodes agricola","hesperiidae","uncommon","1.0–1.2″","May–Jul","Native grasses","Foothill grasslands, chaparral openings",[0,1,5],"Earlier-flying relative of Woodland Skipper. Smaller, brighter orange."),
  B(106,"Sandhill Skipper","Polites sabuleti","hesperiidae","uncommon","0.9–1.1″","May–Sep","Bermuda grass, saltgrass","Coastal areas, salt marshes, open fields",[2,3,5],"Highly variable. Coastal populations associated with salt marsh edges. Jagged ventral markings."),
  B(107,"Sachem","Atalopedes campestris","hesperiidae","common","1.0–1.4″","Year-round","Bermuda grass, lawn grasses","Lawns, parks, fields, roadsides",[0,2,3,5,6],"'Sachem' — the standard common name. Large yellow-orange skipper. Males have distinctive dark patch on forewing. Year-round in urban LA."),
  B(108,"Eufala Skipper","Lerodea eufala","hesperiidae","uncommon","1.0–1.3″","Year-round","Bermuda grass, St. Augustine grass","Lawns, disturbed areas, agricultural margins",[2,4,5],"Gray-brown with small white forewing spots. Can be abundant in irrigated areas."),
  B(109,"Columbian Skipper","Hesperia columbia","hesperiidae","rare","1.0–1.3″","Apr–Jun","Native grasses","Mountain meadows, grasslands",[1,5],"Spring-flying grass skipper. Localized in foothill/mountain grasslands. One brood."),
  B(110,"Juba Skipper","Hesperia juba","hesperiidae","uncommon","1.1–1.4″","May–Sep","Native grasses","Mountain meadows, open woodland clearings",[1,5],"Large bright orange skipper with green-tinged ventral hindwing. Mountain species."),
  B(111,"Northern Cloudywing","Thorybes pylades","hesperiidae","uncommon","1.2–1.6″","Apr–Jul","Legumes, clovers, lotus","Chaparral, woodland edges, foothill canyons",[0,1,5,6],"Dark brown with faint white spots. Fast erratic flight. One brood."),
  B(112,"Mexican Cloudywing","Thorybes mexicanus","hesperiidae","rare","1.2–1.5″","May–Jul","Lotus, legumes","Chaparral openings, rocky slopes",[0,1],"Very similar to Northern Cloudywing. Slightly smaller white spots. Local in foothill chaparral."),
  B(113,"Silver-spotted Skipper","Epargyreus clarus","hesperiidae","rare","1.8–2.5″","May–Aug","Locust, wisteria, legumes","Woodland edges, gardens, riparian",[1,5],"Large skipper with bold silver patch on ventral hindwing. Unmistakable. Rare in LA County."),
  B(114,"Long-tailed Skipper","Urbanus proteus","hesperiidae","vagrant","1.5–2.0″","Jul–Nov","Legumes, beans","Gardens, open areas",[2],"Iridescent blue-green body with long tail streamers. Tropical vagrant; rare records from LA basin."),

  // RIODINIDAE (4)
  B(115,"Mormon Metalmark","Apodemia mormo","riodinidae","uncommon","0.9–1.2″","Aug–Nov","Buckwheat (Eriogonum fasciculatum)","Coastal sage scrub, rocky washes",[0,1,4,5,6],"Checkered dark/white with orange. Fall specialist. LAX dune population described as distinct form. Multiple subspecies."),
  B(116,"Palmer's Metalmark","Apodemia palmerii","riodinidae","rare","0.8–1.1″","Apr–Oct","Mesquite (Prosopis spp.)","Desert washes, mesquite bosque",[4],"Desert metalmark tied to mesquite. Orange-brown with heavy black spots. Antelope Valley desert edges."),
  B(117,"Lange's Metalmark","Apodemia mormo langei","riodinidae","historical","0.9–1.2″","Aug–Sep","Buckwheat","Inland dunes, sand deposits",[2],"Historic record. This federally endangered subspecies is now restricted to Antioch Dunes; LA populations likely represent other mormo forms."),
  B(118,"Wright's Metalmark","Calephelis wrightii","riodinidae","rare","0.7–1.0″","Apr–Oct","Sweetbush (Bebbia juncea)","Desert washes, rocky canyon bottoms",[4],"Tiny dark metalmark with metallic silver lines. Desert species at county's edge. Very local."),
  B(119,"Fatal Metalmark","Calephelis nemesis","riodinidae","vagrant","0.7–1.0″","Apr–Nov","Seepwillow (Baccharis salicifolia)","Desert washes, riparian edges",[4],"VAGRANT. Desert species occasionally reaching western Antelope Valley. Very small, dark with fine metallic lines. Named for the Fateful River in Greek myth."),

  // === VAGRANTS & STRAYS ===
  // Papilionidae
  B(120,"Polydamas Swallowtail","Battus polydamas","papilionidae","vagrant","3.5–4.5″","Year-round","Pipevines (Aristolochia spp.)","Urban gardens, disturbed areas",[2],"VAGRANT. Tailless tropical swallowtail. A single iNaturalist record from LA (March 2025). Almost certainly an escaped/released individual or extreme stray from cultivation."),
  B(121,"Black Swallowtail","Papilio polyxenes","papilionidae","vagrant","2.8–3.5″","Apr–Sep","Parsley family, fennel, dill","Gardens, open areas",[2,5],"VAGRANT. Very rare stray from eastern/central populations. Can be confused with Anise Swallowtail; distinguished by more extensive blue on hindwing and different pupil shape in eyespot."),

  // Pieridae
  B(122,"Western White","Pontia occidentalis","pieridae","vagrant","1.3–1.8″","Apr–Aug","Rock cress, mustards","Mountain meadows, open areas",[1],"VAGRANT. Higher-elevation species occasionally reaching upper San Gabriel Mountains. Similar to Checkered White but with heavier green veining below."),
  B(123,"Tailed Orange","Eurema proterpia","pieridae","vagrant","1.3–1.8″","Jul–Nov","Legumes, Desmanthus","Desert scrub, open brushy areas",[4],"VAGRANT. Tropical species that strays north from Mexico/Arizona during late summer. Distinctive pointed hindwing 'tail.' Very rare in county."),
  B(124,"Little Yellow","Pyrisitia lisa","pieridae","vagrant","1.0–1.5″","Jun–Oct","Cassia, senna, partridge pea","Open areas, roadsides",[2,4],"VAGRANT. Small bright yellow butterfly. Rare stray from desert/eastern populations. Formerly more regular when senna was widely planted."),
  B(125,"Stella Orangetip","Anthocharis stella","pieridae","rare","1.2–1.6″","Mar–May","Rock cress, jewel flower","Mountain chaparral, foothill canyons",[1],"Sometimes treated as subspecies of Sara Orangetip. Flies at higher elevation in San Gabriels. Males with brilliant orange tips."),

  // Lycaenidae
  B(126,"Leda Ministreak","Ministrymon leda","lycaenidae","vagrant","0.7–0.9″","Apr–Nov","Mesquite, acacias","Desert washes, scrub edges",[4],"VAGRANT. Tiny gray hairstreak with orange patches. Desert species occasionally reaching western Antelope Valley in warm years."),
  B(127,"Small Blue","Philotiella speciosa","lycaenidae","extirpated","0.6–0.8″","Apr–Jun","Buckwheat (Eriogonum spp.)","Sandy washes, desert scrub",[4],"EXTIRPATED. Historically recorded from desert margins of LA County. Among the smallest North American butterflies. Likely lost from county due to development of Antelope Valley fringe habitats."),
  B(128,"Boisduval's Blue","Icaricia icarioides","lycaenidae","extirpated","0.9–1.2″","Apr–Jul","Lupines (Lupinus spp.)","Coastal dunes, grasslands, open scrub",[2,3],"EXTIRPATED. Historical records from coastal dune systems including Palos Verdes and El Segundo. Related to Xerces Blue (extinct, San Francisco). Formerly bred on coastal lupine stands now destroyed by urbanization."),
  B(129,"Melissa Blue","Icaricia melissa","lycaenidae","vagrant","0.9–1.1″","May–Sep","Lupines, alfalfa, astragalus","Mountain meadows, agricultural edges",[1,4],"VAGRANT. Occasional stray into high San Gabriels and desert edge. Males bright blue with orange sub-marginal band. Distinguished from Acmon by ventral hindwing pattern."),
  B(130,"Desert Green Hairstreak","Callophrys comstocki","lycaenidae","rare","0.9–1.1″","Mar–May","Buckwheat, Eriogonum spp.","Desert rocky slopes, arid washes",[4],"Green underside like Bramble Hairstreak but in desert habitats. Localized on desert-facing slopes of Antelope Valley."),
  B(131,"Nelson's Hairstreak","Callophrys nelsoni","lycaenidae","rare","0.9–1.1″","May–Jul","Incense cedar, junipers","Coniferous forest, mixed woodland",[1],"Specialist on incense cedar. Rich reddish-brown with faint white line. Found in conifer belt of upper San Gabriel Mountains."),

  // Nymphalidae
  B(132,"American Snout","Libytheana carinenta","nymphalidae","vagrant","1.5–2.0″","Year-round","Hackberry (Celtis spp.)","Riparian woodland, canyon bottoms",[5,6],"VAGRANT. Named for elongated labial palps that form a 'snout.' Irruptive from desert; huge flights occasionally reach LA County from Arizona/Mexico. Brown with orange patches."),
  B(133,"Coronis Fritillary","Speyeria coronis","nymphalidae","extirpated","2.2–3.0″","Jun–Sep","Violets (Viola spp.)","Mountain meadows, open woodland",[1],"EXTIRPATED. Formerly bred in San Gabriel Mountain meadows. Large silver-spotted fritillary. Not reliably recorded in county for decades. Habitat degradation and drought likely causes."),
  B(134,"Great Spangled Fritillary","Speyeria cybele","nymphalidae","historical","2.5–3.5″","Jun–Sep","Violets","Moist meadows, woodland clearings",[1],"HISTORIC ONLY. Questionable historical records from San Gabriels; may represent misidentified Coronis Fritillary. Included for completeness from Emmel & Emmel (1973) county list."),
  B(135,"Zerene Fritillary","Speyeria zerene","nymphalidae","historical","2.0–2.8″","Jun–Sep","Violets","Mountain meadows, grasslands",[1],"HISTORIC ONLY. Old records from San Gabriel Mountains. Large fritillary with silver or gold spots below. May have been present historically when montane meadows were more intact."),
  B(136,"Mexican Fritillary","Euptoieta hegesia","nymphalidae","vagrant","2.0–2.5″","Jul–Nov","Passion vine, violets, turnera","Open areas, desert scrub edges",[4],"VAGRANT. Tropical species straying north in late summer. Resembles Variegated Fritillary but brighter orange-tawny with fewer dark markings. Extremely rare."),
  B(137,"Common Mestra","Mestra amymone","nymphalidae","vagrant","1.3–1.8″","Jul–Nov","Noseburn (Tragia)","Open brushy areas, washes",[4],"VAGRANT. Pale gray-white with orange trailing edge. Desert origin, strays into Antelope Valley in warm years. Also called 'White Mestra.'"),
  B(138,"Red-spotted Purple","Limenitis arthemis astyanax","nymphalidae","vagrant","2.5–3.5″","May–Sep","Willows, cottonwood, cherry","Woodland edges, riparian corridors",[1],"VAGRANT. Blue-black with iridescent blue and red-orange spots ventrally. Extremely rare stray; more common much further north and east."),
  B(139,"Empress Leilia","Asterocampa leilia","nymphalidae","vagrant","1.8–2.5″","May–Oct","Desert hackberry (Celtis ehrenbergiana)","Desert riparian areas with hackberry",[4],"VAGRANT. Pale gray-brown emperor butterfly. Occasionally reaches Antelope Valley from desert populations in Arizona. Rarely confirmed in county."),
  B(140,"Hackberry Emperor","Asterocampa celtis","nymphalidae","vagrant","1.5–2.3″","May–Sep","Hackberry (Celtis spp.)","Riparian woodland, parks",[5],"VAGRANT. Warm brown with dark eyespots and white forewing spots. Very rare; confirmed only a handful of times in county history."),

  // Hesperiidae
  B(141,"White Checkered-Skipper","Burnsius albescens","hesperiidae","uncommon","0.75–1.2″","Feb–Oct","Mallows (Malvaceae)","Open disturbed areas, gardens",[0,2,3,5,6],"Recently split from Common Checkered-Skipper. Whiter overall with less distinct markings. More common in drier, southern areas. Taxonomy still debated."),
  B(142,"Dorantes Longtail","Urbanus dorantes","hesperiidae","vagrant","1.5–1.8″","Jul–Nov","Legumes, beggar's tick","Gardens, open scrub",[2],"VAGRANT. Brown skipper with long tail streamers. Tropical species that rarely strays into LA basin. Distinguished from Long-tailed Skipper by brown (not iridescent) body."),
  B(143,"Arizona Powdered-Skipper","Systasea zampa","hesperiidae","vagrant","1.0–1.3″","Apr–Oct","Mallows","Desert scrub, rocky washes",[4],"VAGRANT. Orange-brown with distinctive powdery gray scaling. Desert species recorded a handful of times at Antelope Valley's eastern margins."),
  B(144,"Funeral Duskywing (Afranius)","Erynnis afranius","hesperiidae","rare","1.1–1.4″","Apr–Sep","Astragalus, lotus, legumes","Open scrub, chaparral edges, grasslands",[4,5],"Afranius Duskywing. Very similar to Funereal but lacks white hindwing fringe. Desert-edge species in northern county. Identification often requires close examination."),
  B(145,"Persius Duskywing","Erynnis persius","hesperiidae","extirpated","1.1–1.4″","Apr–Jun","Lupines, lotus","Open woodland, meadow edges",[1],"EXTIRPATED. Historically recorded from San Gabriel Mountains. Host plant specialist on lupines. Not confirmed in county for decades; habitat loss and lupine decline likely responsible."),
  B(146,"Strecker's Giant-Skipper","Megathymus streckeri","hesperiidae","historical","2.5–3.0″","May–Jul","Yucca species","Desert scrub, yucca grassland",[4],"HISTORIC ONLY. Old records from desert margin of LA County. Massive skipper whose larvae bore into yucca roots. Rarely collected; may still occur in remote Antelope Valley yucca stands."),
  B(147,"Mojave Sootywing","Hesperopsis libya","hesperiidae","rare","0.8–1.1″","Apr–Oct","Saltbush (Atriplex spp.)","Alkali scrub, desert wash edges",[4],"Dark brown-black skipper of desert salt-scrub. Localized in Antelope Valley where saltbush flats persist. Multiple broods."),
  B(148,"Lindsey's Skipper","Hesperia lindseyi","hesperiidae","rare","1.0–1.3″","May–Jul","Native grasses","Foothill grasslands, chaparral clearings",[0,1,5],"Orange skipper with crisp ventral markings. One spring brood. Localized in foothill grasslands. Named for entomologist A.W. Lindsey."),
];

// Real LA County cartography - coordinates from Census/GeoJSON data
const LA_BOUNDS = { minLng: -118.96, maxLng: -117.62, minLat: 33.68, maxLat: 34.84 };
const MAP_W = 380, MAP_H = 340;
function geoToSvg(lng, lat) {
  const x = ((lng - LA_BOUNDS.minLng) / (LA_BOUNDS.maxLng - LA_BOUNDS.minLng)) * MAP_W;
  const y = ((LA_BOUNDS.maxLat - lat) / (LA_BOUNDS.maxLat - LA_BOUNDS.minLat)) * MAP_H;
  return [Math.round(x*10)/10, Math.round(y*10)/10];
}
function coordsToPath(coords) {
  return coords.map((c,i) => {const [x,y]=geoToSvg(c[0],c[1]); return (i===0?"M":"L")+x+" "+y;}).join(" ")+" Z";
}
const COUNTY_MAINLAND = [[-117.6687,34.8204],[-117.6468,34.2892],[-117.7289,34.0208],[-117.7673,34.0263],[-117.8056,33.977],[-117.7837,33.9441],[-117.9754,33.9441],[-117.9754,33.9003],[-118.0575,33.8455],[-118.1178,33.7415],[-118.1835,33.7634],[-118.1835,33.7196],[-118.2602,33.7031],[-118.4135,33.7415],[-118.43,33.7743],[-118.3916,33.8401],[-118.4628,33.9715],[-118.545,34.0372],[-118.7476,34.0318],[-118.8024,33.9989],[-118.9448,34.0427],[-118.9393,34.0756],[-118.786,34.1687],[-118.6655,34.1687],[-118.6655,34.2399],[-118.6326,34.2399],[-118.8846,34.7931],[-118.8955,34.8204]];
const CATALINA = [[-118.6052,33.4786],[-118.5614,33.4348],[-118.4902,33.4183],[-118.4574,33.3198],[-118.315,33.3033],[-118.3314,33.3581],[-118.3697,33.4074],[-118.6052,33.4786]];
const ECO_ZONES_GEO = {
  0:[[-118.88,34.04],[-118.78,34.07],[-118.68,34.09],[-118.58,34.11],[-118.48,34.12],[-118.38,34.13],[-118.35,34.10],[-118.40,34.05],[-118.48,34.03],[-118.58,34.00],[-118.68,34.01],[-118.78,34.03],[-118.88,34.04]],
  1:[[-118.38,34.15],[-118.22,34.17],[-118.08,34.16],[-117.88,34.15],[-117.72,34.18],[-117.67,34.30],[-117.67,34.42],[-117.82,34.42],[-118.10,34.39],[-118.28,34.35],[-118.42,34.28],[-118.48,34.22],[-118.38,34.15]],
  2:[[-118.52,34.03],[-118.48,34.03],[-118.40,34.05],[-118.35,34.08],[-118.28,34.08],[-118.15,34.05],[-118.02,33.99],[-117.92,33.95],[-117.87,33.90],[-117.95,33.85],[-118.06,33.82],[-118.12,33.74],[-118.26,33.70],[-118.41,33.74],[-118.43,33.78],[-118.46,33.84],[-118.52,33.96],[-118.52,34.03]],
  3:[[-118.43,33.78],[-118.37,33.78],[-118.32,33.74],[-118.33,33.71],[-118.42,33.72],[-118.45,33.76],[-118.43,33.78]],
  4:[[-118.88,34.80],[-117.67,34.82],[-117.67,34.48],[-117.82,34.42],[-118.10,34.39],[-118.28,34.35],[-118.48,34.28],[-118.63,34.24],[-118.88,34.79],[-118.88,34.80]],
  5:[[-118.78,34.18],[-118.63,34.24],[-118.48,34.28],[-118.42,34.22],[-118.38,34.15],[-118.38,34.13],[-118.48,34.12],[-118.58,34.11],[-118.68,34.09],[-118.78,34.10],[-118.82,34.17],[-118.78,34.18]],
  6:[[-118.02,34.01],[-117.88,34.02],[-117.72,33.99],[-117.67,33.92],[-117.73,33.88],[-117.87,33.90],[-117.97,33.94],[-118.02,34.01]],
};
const ZONE_LABELS = [[0,-118.58,34.06,"Santa Monica Mtns"],[1,-118.05,34.28,"San Gabriel Mtns"],[2,-118.22,33.90,"Coastal Basin"],[3,-118.38,33.74,"Palos Verdes"],[4,-118.30,34.65,"Antelope Valley"],[5,-118.58,34.18,"Santa Clarita"],[6,-117.82,33.95,"Puente Hills"]];

// Observation data cache for frequency maps
const obsCache = {};

function RangeMap({ species }) {
  const [grid, setGrid] = useState(null);
  const [totalObs, setTotalObs] = useState(0);
  const [loading, setLoading] = useState(false);

  // ESRI World Imagery satellite tile — aligned to our exact bounding box
  const satUrl = "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/export?bbox="+
    LA_BOUNDS.minLng+","+LA_BOUNDS.minLat+","+LA_BOUNDS.maxLng+","+LA_BOUNDS.maxLat+
    "&bboxSR=4326&size="+MAP_W*2+","+MAP_H*2+"&imageSR=4326&format=png&f=image";

  useEffect(() => {
    const sciParts = species.scientific.split(" ");
    const query = sciParts.length >= 2 ? sciParts[0]+" "+sciParts[1] : species.scientific;
    const key = query.toLowerCase();
    if (obsCache[key]) { setGrid(obsCache[key].cells); setTotalObs(obsCache[key].total); return; }
    if (["extirpated","historical"].includes(species.status)) { setGrid([]); setTotalObs(0); return; }
    setLoading(true);
    fetch("https://api.inaturalist.org/v1/observations?taxon_name="+encodeURIComponent(query)+"&place_id=962&geo=true&per_page=200&quality_grade=research&only_id=false&fields=location")
      .then(r=>r.ok?r.json():Promise.reject())
      .then(data => {
        const pts = (data.results||[]).map(o => {
          if (!o.location) return null;
          const [lat,lng] = o.location.split(",").map(Number);
          return [lng,lat];
        }).filter(Boolean);
        const COLS=14,ROWS=12;
        const cells = {};
        pts.forEach(([lng,lat]) => {
          const c = Math.floor((lng-LA_BOUNDS.minLng)/(LA_BOUNDS.maxLng-LA_BOUNDS.minLng)*COLS);
          const r = Math.floor((LA_BOUNDS.maxLat-lat)/(LA_BOUNDS.maxLat-LA_BOUNDS.minLat)*ROWS);
          if (c>=0&&c<COLS&&r>=0&&r<ROWS) { const k=r+","+c; cells[k]=(cells[k]||0)+1; }
        });
        const result = Object.entries(cells).map(([k,count]) => {
          const [r,c] = k.split(",").map(Number);
          return {r,c,count};
        });
        obsCache[key] = {cells:result, total:pts.length};
        setGrid(result);
        setTotalObs(pts.length);
        setLoading(false);
      })
      .catch(() => { setGrid([]); setTotalObs(0); setLoading(false); });
  }, [species.id, species.scientific, species.status]);

  const COLS=14,ROWS=12;
  const cellW = MAP_W/COLS, cellH = MAP_H/ROWS;

  // Absolute-threshold calibration by conservation status
  // Prevents rare species with 1 obs from showing "Peak"
  const densityColor = (count) => {
    const st = species.status;
    if (st==="common") {
      if (count>=20) return "rgba(210,55,15,0.75)";
      if (count>=8) return "rgba(235,125,25,0.65)";
      if (count>=3) return "rgba(255,180,40,0.50)";
      return "rgba(255,215,70,0.35)";
    } else if (st==="uncommon") {
      if (count>=12) return "rgba(210,55,15,0.75)";
      if (count>=5) return "rgba(235,125,25,0.65)";
      if (count>=2) return "rgba(255,180,40,0.50)";
      return "rgba(255,215,70,0.35)";
    } else {
      // rare, endangered, vagrant — conservative thresholds
      if (count>=6) return "rgba(210,55,15,0.75)";
      if (count>=3) return "rgba(235,125,25,0.65)";
      if (count>=2) return "rgba(255,180,40,0.50)";
      return "rgba(255,215,70,0.35)";
    }
  };

  const [satLoaded, setSatLoaded] = useState(false);
  const [satError, setSatError] = useState(false);

  return (
    <div>
      <svg viewBox={"0 0 "+MAP_W+" "+MAP_H} style={{ width:"100%", maxWidth:MAP_W, height:"auto", borderRadius:6, border:"1px solid #c8c0b0", display:"block" }}>
        <defs>
          <clipPath id="ctyClip"><path d={coordsToPath(COUNTY_MAINLAND)}/><path d={coordsToPath(CATALINA)}/></clipPath>
          <clipPath id="ctyMainClip"><path d={coordsToPath(COUNTY_MAINLAND)}/></clipPath>
        </defs>
        {/* Ocean base */}
        <rect width={MAP_W} height={MAP_H} fill="#2c5f82"/>
        {/* Satellite imagery background — loads from ESRI World Imagery */}
        {!satError && <image href={satUrl} x="0" y="0" width={MAP_W} height={MAP_H}
          clipPath="url(#ctyClip)" preserveAspectRatio="none"
          style={{imageRendering:"auto"}}
          onLoad={()=>setSatLoaded(true)} onError={()=>setSatError(true)} />}
        {/* Fallback clean terrain if satellite fails to load */}
        {satError && <>
          <path d={coordsToPath(COUNTY_MAINLAND)} fill="#c8c0a8"/>
          <path d={coordsToPath(CATALINA)} fill="#bab2a0"/>
          <path d={coordsToPath(ECO_ZONES_GEO[4])} fill="#d0c8a8"/>
          <path d={coordsToPath(ECO_ZONES_GEO[1])} fill="#7a9068"/>
          <path d={coordsToPath(ECO_ZONES_GEO[5])} fill="#98a880"/>
          <path d={coordsToPath(ECO_ZONES_GEO[0])} fill="#6a8a58"/>
          <path d={coordsToPath(ECO_ZONES_GEO[2])} fill="#b8b0a0"/>
          <path d={coordsToPath(ECO_ZONES_GEO[3])} fill="#88a870"/>
          <path d={coordsToPath(ECO_ZONES_GEO[6])} fill="#90a070"/>
        </>}
        {/* Frequency grid (clipped to mainland county) */}
        <g clipPath="url(#ctyMainClip)">
          {grid && grid.map((cell,i) => (
            <rect key={i} x={cell.c*cellW+.5} y={cell.r*cellH+.5} width={cellW-1} height={cellH-1}
              fill={densityColor(cell.count)} rx="2"
              stroke="rgba(255,255,255,0.2)" strokeWidth=".5"/>
          ))}
          {loading && (
            <g>
              <rect x={MAP_W/2-60} y={MAP_H/2-12} width="120" height="24" rx="12" fill="rgba(0,0,0,0.6)"/>
              <text x={MAP_W/2} y={MAP_H/2+4} textAnchor="middle" fontSize="9" fill="#fff" fontFamily="Georgia,serif">Loading observations…</text>
            </g>
          )}
          {grid && grid.length===0 && !loading && (
            <g>
              <rect x={MAP_W/2-80} y={MAP_H/2-12} width="160" height="24" rx="12" fill="rgba(0,0,0,0.55)"/>
              <text x={MAP_W/2} y={MAP_H/2+4} textAnchor="middle" fontSize="8" fill="#ddd" fontFamily="Georgia,serif">
                {["extirpated","historical"].includes(species.status) ? "No current observations — historical record only" : "No research-grade observations found"}
              </text>
            </g>
          )}
        </g>
        {/* County + island borders */}
        <path d={coordsToPath(COUNTY_MAINLAND)} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
        <path d={coordsToPath(COUNTY_MAINLAND)} fill="none" stroke="#3a3428" strokeWidth=".8"/>
        <path d={coordsToPath(CATALINA)} fill="none" stroke="#3a3428" strokeWidth=".6"/>
        {/* Zone boundary dashes — subtle over satellite */}
        {Object.entries(ECO_ZONES_GEO).map(([zid,coords]) => (
          <path key={zid} d={coordsToPath(coords)} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth=".6" strokeDasharray="5,4"/>
        ))}
        {/* Zone labels — white halo for legibility on satellite */}
        {ZONE_LABELS.map(([zid,lng,lat,label]) => {
          const [x,y]=geoToSvg(lng,lat);
          return (<g key={zid}>
            <text x={x} y={y} textAnchor="middle" fontSize="8" fontFamily="Georgia,serif" fill="#000" fontWeight="bold" stroke="rgba(255,255,255,0.85)" strokeWidth="3" paintOrder="stroke" strokeLinejoin="round">{label}</text>
            <text x={x} y={y} textAnchor="middle" fontSize="8" fontFamily="Georgia,serif" fill="#fff" fontWeight="bold" style={{textShadow:"0 1px 2px rgba(0,0,0,0.5)"}}>{label}</text>
          </g>);
        })}
        {/* Ocean + island labels */}
        <text x={geoToSvg(-118.74,33.78)[0]} y={geoToSvg(-118.74,33.78)[1]} fontSize="11" fontFamily="Georgia,serif" fontStyle="italic" fill="rgba(160,200,230,0.9)" fontWeight="bold" transform={"rotate(-12,"+geoToSvg(-118.74,33.78).join(",")+")"}>Pacific Ocean</text>
        <text x={geoToSvg(-118.44,33.36)[0]} y={geoToSvg(-118.44,33.36)[1]} fontSize="7" fontFamily="Georgia,serif" fontStyle="italic" fill="rgba(160,200,230,0.8)">Santa Catalina I.</text>
        {/* Scale bar */}
        {(()=>{const [x1,y1]=geoToSvg(-117.88,33.72);const [x2]=geoToSvg(-117.66,33.72);return <g>
          <rect x={x1-2} y={y1-5} width={x2-x1+4} height="16" rx="3" fill="rgba(0,0,0,0.5)"/>
          <line x1={x1} y1={y1} x2={x2} y2={y1} stroke="#fff" strokeWidth="1.5"/>
          <line x1={x1} y1={y1-3} x2={x1} y2={y1+3} stroke="#fff" strokeWidth="1"/><line x1={x2} y1={y1-3} x2={x2} y2={y1+3} stroke="#fff" strokeWidth="1"/>
          <text x={(x1+x2)/2} y={y1+9} textAnchor="middle" fontSize="6" fill="#fff" fontFamily="Georgia,serif">~15 mi</text>
        </g>;})()}
        {/* Legend */}
        <g transform={"translate(8,"+(MAP_H-34)+")"}>
          <rect width="165" height="30" rx="4" fill="rgba(0,0,0,0.65)" stroke="rgba(255,255,255,0.15)" strokeWidth=".5"/>
          <text x="6" y="11" fontSize="7" fill="#eee" fontFamily="Georgia,serif" fontWeight="bold">iNaturalist Observations</text>
          {totalObs > 0 && <text x="120" y="11" fontSize="6.5" fill="#aaa" fontFamily="Georgia,serif">{totalObs} records</text>}
          {[["rgba(255,215,70,0.55)","1–2"],["rgba(255,180,40,0.65)","3–5"],["rgba(235,125,25,0.75)","6–12"],["rgba(210,55,15,0.85)","13+"]].map(([c,l],i) => (
            <g key={i} transform={"translate("+(6+i*39)+",15)"}>
              <rect width="12" height="10" rx="2" fill={c} stroke="rgba(255,255,255,0.3)" strokeWidth=".5"/>
              <text x="15" y="8" fontSize="6.5" fill="#ddd" fontFamily="Georgia,serif">{l}</text>
            </g>
          ))}
        </g>
      </svg>
      {!satLoaded && !satError && <div style={{fontSize:10,color:"#a09880",textAlign:"center",marginTop:2,fontStyle:"italic"}}>Satellite imagery loading…</div>}
    </div>
  );
}

// Field mark identification text per species
const FIELD_MARKS = {1:"Deep yellow ground; narrow black tiger stripes; blue+orange lunules near tail; broad hindwing",2:"Cream-WHITE ground (not yellow); THICKER black stripes than Tiger; blue+orange lunules near tail",3:"Black with yellow spots in rows; orange+blue eyespot near short tail; anise/fennel host",4:"Iridescent blue on black hindwings above; row of orange spots below; NO tails; pipevine host",5:"Black with yellow diagonal band across wings; very large; breeds on citrus and rue",6:"Short tails; dark with cream-yellow bands; compact body; smallest NA swallowtail",7:"Like W. Tiger but TWO tails per hindwing; slightly larger; mountain canyons",8:"White above; 1-2 small black forewing spots; veins GREEN below; very common garden species",9:"White with crisp dark checkered margins; heavier pattern than Cabbage White",10:"White above; MARBLED GREEN below; flies early spring (Feb-Apr); male yellow-tipped antennae",11:"White above; BOLD green veining below; desert and arid washes; larger than Sara",12:"Large; uniform bright LEMON yellow; no markings above; cell spot below; tropical stray",13:"Orange above with wide BLACK border; yellow below with silver cell spot; common garden visitor",14:"Yellow with clean black border; smaller than Cloudless; pink-edged cell spot below",15:"Black pattern forms DOG FACE profile on yellow forewing; pink-edged below; state butterfly",16:"White; male has vivid ORANGE wingtips; green marbling below; early spring chaparral",17:"White; YELLOW-orange wingtips; desert species; Sara Orangetip relative",18:"Tiny (3/4 in.); pale yellow; dark forewing bar; black-tipped antennae; weedy areas",19:"Bright orange above; WINTER form dark brown below with silver spots; multivoltine",20:"Yellow; faint dog-face pattern; Mountain Yellow = high elevation form",21:"Pointed forewing; dog-face pattern; DESERT specialist; Southern Dogface",22:"Deep orange; large; rare tropical stray; LACKS black border of Cloudless",23:"Bright yellow; strong black borders; mountain meadows; related to Cloudless",24:"White with HEAVY black veining above; pine/fir canopy; mountain species",25:"White; HEAVY green marbling below; pearly iridescence; uncommon",26:"Gray above; thin hair-like tail; bright ORANGE cap over blue eyespot at tail",27:"Warm brown; thin white postmedian LINE below; no orange on tail; oaks",28:"Brown; ORANGE lunules near thin tail below; larger than Gray Hairstreak",29:"Golden-brown with fine tails; OAK specialist; uncommon foothill species",30:"Gray-brown; reduced markings below; NO orange at tail; quiet habits",31:"Males stunning IRIDESCENT BLUE-PURPLE above; females brown; oak-mistletoe host",32:"Dark reddish-brown; NO tail; flies very early spring (Feb-Mar); Ceanothus host",33:"Dark chocolate-brown; NO tail; Dudleya (stonecrop) specialist; rare",34:"Dark above; brilliant EMERALD GREEN underside; mountain chaparral; Ceanothus host",35:"Dark blue-purple above; mistletoe specialist; no tail; uncommon",36:"Tiny (under 1/2 in.); SMALLEST butterfly in N. America; coastal salt flats",37:"Brown+white STRIPED pattern below; common in gardens; marine influence area",38:"Pale blue; unique small TAIL (rare in blues); mountain elevations; single-brooded",39:"Pale silvery-blue; early spring (Mar-Apr); ventral spots small+faint; Ceanothus host",40:"Pale blue; CRISP round dark spots on clean white below; flies early spring",41:"Blue above (males); orange+IRIDESCENT BLUE band on hindwing margin; multibro; buckwheat host",42:"Like Acmon but SINGLE-BROODED; brighter blue males; black inner edge on orange lunules above",43:"Silvery-blue above; gray ground below with round black spots; NO orange band (unlike Acmon)",44:"ENDANGERED; tiny blue; ONLY at LAX dunes area; Seacliff buckwheat host",45:"ENDANGERED; silvery-blue; ONLY Palos Verdes Peninsula; locoweed host",46:"Blue above; SQUARED orange spots in marginal band; buckwheat host",47:"Bright blue; higher mountain elevations; related to Acmon complex",48:"Small; blue male / brown female; orange submarginal spots; dotted-blue group",49:"Dark postmedian forewing spots diagnostic; Reakirt's Blue; irruptive migrant",50:"Yellow-brown; dark spots; ENDEMIC to San Emigdio area; buckwheat host",51:"Males PURPLISH above (unusual for copper); orange zigzag below; dock/sorrel host",52:"Large; males dark PURPLE above; females orange with dark spots; uncommon foothill",53:"Males brilliant iridescent BLUE above; unique among coppers; buckwheat host; ENDANGERED",54:"Orange-brown with white spots; edged-copper pattern; rare vagrant",55:"Tiny; brilliant cerulean blue above; orange aurora below; sonoran influence",56:"Orange with BLACK veins; white dots in black border; ICONIC migrant; milkweed host",57:"Dark MAHOGANY-brown (not orange); white spots; NO black veining; milkweed host",58:"Bright orange above; SILVER-washed underside; long narrow wings; passion vine host",59:"Tawny-orange above; mottled brown-tan below with NO silver; violet host",60:"Orange-black; WHITE bar on forewing; 4 SMALL eyespots on ventral hindwing; cosmopolitan migrant",61:"ORANGE bar on forewing (not white); cobwebbed ventral HW; NO large eyespots below; mallow host",62:"Dark black; bold RED-ORANGE + white bands; strongly banded; nettle host; territorial",63:"2 LARGE eyespots on ventral hindwing; small white dot in orange forewing field; everlasting host",64:"Dark MAROON-purple; cream-yellow marginal border; MOURNING CLOAK; overwintering adult",65:"Brilliant uniform ORANGE; irruptive; sometimes abundant, other years absent; elm host",66:"Dark above; narrow orange submarginal band; California Tortoiseshell; Ceanothus host; irruptive",67:"Ragged irregular wing edges; silver COMMA or L-mark on ventral hindwing; woodland",68:"Like Satyr Comma but DARKER; hoary gray-frosted ventral HW; mountain; Ribes host",69:"Black above; ORANGE band + white spots on forewing; California Sister; live oak host",70:"Black; bold white median band; ORANGE forewing tips; Lorquin's Admiral; willow host",71:"Brown; FOUR large colorful EYESPOTS (2 per wing); multicolored; open weedy areas",72:"Variable mosaic of black+red+yellow; crescents/checks; highly variable; paintbrush host",73:"Red+black checkerboard; very LOCAL colonies; specific hillsides; plantain host",74:"ENDANGERED; bold red-black-white checkerboard; local colonies on specific ridges",75:"Red-orange + black checks; SAGE SCRUB habitat; Indian paintbrush host",76:"Dark ground; pale cream bands; dark checkerspots; paintbrush host; mountain",77:"Orange; complex fine black reticulated pattern; larger than other checkerspots",78:"VERY SMALL (3/4 in.); fine black lines on orange; desert; dwarf plantain host",79:"Small orange-black checks; on thistles in disturbed areas; Mylitta Crescent",80:"Delicate orange-black pattern; desert washes; short flight period",81:"Soft tawny-brown; SINGLE small forewing eyespot; grassland edges; bouncing flight",82:"Brown; TWO prominent forewing eyespots; grass-feeding; Common Wood-Nymph",83:"Smaller than Common; ONE forewing eyespot; mountain meadows above 5000ft",84:"Same as Common Buckeye; dark seasonal/regional form; reddish-brown late season",85:"Pale gray-brown; SMALL eyespots; hackberry specialist; vagrant to LA",86:"Warm brown; dark eyespots on FW; white apical spots; hackberry host; vagrant",87:"Pale straw-cream; bouncing low flight over grasslands; eyespots tiny or absent",88:"EXTIRPATED from LA; unsilvered (tan) spots below; distinguished from other Speyeria",89:"Large fritillary; prominent SILVER spots on green-brown ventral HW; violet host; historical",90:"SMALLEST Speyeria fritillary; single summer brood; silver-spotted below; mountain",91:"Dark brown; more BANDING pattern than Common Buckeye; tropical stray",93:"Males bright ORANGE-GOLD above; dark female with pale spots; common on LAWNS; grass host",94:"Dark brown with orange patches; SHADE-loving; Eufala Skipper; grass host",95:"Dark brown; WHITE hindwing fringe (KEY mark); narrow pointed FW; legume host",96:"Dark brown; white HW fringe BUT with brown bases; GRAY overscaling on FW; OAK host",97:"LARGEST duskywing; heavily MOTTLED FW (tan+dark brown contrast); BROWN fringe; spring; oak host",98:"Very dark males; gray overscaling on FW; Ceanothus host; smaller than Propertius",99:"Gray-brown; pale-tipped fringe (NOT white); smaller than Funereal; legume host",100:"Black-white CHECKERED pattern; hairy body; common in disturbed areas; mallow host",101:"Like Common Checkered but predominantly WHITE; drier habitats; mallow host",102:"Nearly black; TINY white spots; compact body; Common Sootywing; amaranth host",103:"Brown; SALT MARSH specialist; Wandering Skipper; saltgrass host; coastal only",104:"Warm orange-brown; LATE season (Aug-Oct); Woodland Skipper; grass host",105:"Bright orange; EARLIER season than Woodland; smaller; Umber Skipper relative",106:"Variable tawny; JAGGED dark ventral chevrons; Sandhill Skipper",107:"Large orange-gold male; dark brown STIGMA patch on male forewing; grass host; Sachem",108:"Gray-brown; small WHITE forewing spots; Columella/Common Sootywing relative",109:"Orange; SPRING only (one brood); mountain meadow; Juba Skipper",110:"Large orange; GREEN-tinged hindwing below; Rural Skipper; one brood",111:"Dark brown; FAINT translucent white FW spots; fast erratic flight; Northern Cloudywing",112:"Like N. Cloudywing but SMALLER hyaline FW spots; Southern Cloudywing",113:"Large; bold SILVER patch on ventral hindwing; Silver-spotted Skipper; legume host",114:"Iridescent blue-green body; LONG tail streamers on hindwing; legume host",115:"Dark+white checkered; orange below; FALL flier; Erichson's Skipper; desert",116:"Orange-brown with black spots; MESQUITE specialist; desert skipper",117:"HISTORIC; dune habitat form; Los Angeles area; habitat now developed",118:"Tiny dark brown; METALLIC silver lines on ventral HW; Wright's Metalmark",119:"Very small; dark; METALLIC silver lines; Mormon Metalmark; buckwheat host",120:"Tailless; black with rows of yellow spots; tropical vagrant from Mexico",121:"Black; extensive blue on hindwing above (more than Anise); vagrant from Mexico/desert",122:"Heavier green marbling than Sara Orangetip; desert vagrant",123:"Orange; pointed hindwing TAIL; tropical vagrant; Tailed-Orange",124:"Small bright yellow; rounded wings; desert vagrant from Baja; Dainty Sulphur relative",125:"White; orange tips; mountain; larger wingtips than Sara Orangetip",126:"Tiny gray; orange dorsal patches; desert pygmy-blue relative",127:"EXTIRPATED; among smallest blues in N. America; coastal habitat lost",128:"EXTIRPATED from LA; coastal dune blue; closest relative to extinct Xerces Blue",129:"Blue; orange submarginal band; desert vagrant; buckwheat host",130:"Dark above; GREEN mottled below; desert rocky slopes; Nais Metalmark",131:"Reddish-brown; incense cedar specialist; Brown Elfin relative; mountain",132:"Elongated SNOUT-like palps; brown+orange; irruptive migrant; hackberry host",133:"EXTIRPATED; medium fritillary with silver spots; lost from LA mountains",134:"HISTORIC; questionable old LA County records; Great Spangled type",135:"HISTORIC; silver and gold ventral spots; no confirmed LA specimens",136:"Brighter orange than Painted Lady; tropical vagrant; Mexican Fritillary",137:"Pale gray-white above; orange trailing HW edge; tropical vagrant",138:"Blue-black iridescent above; ventral red spots on black; tropical vagrant; rare",139:"Pale gray-brown; small eyespots; Empress Leilia; hackberry host; vagrant",140:"Warm brown; white FW spots; dark eyespots; Hackberry Emperor; very rare vagrant",141:"WHITER pattern than Common Checkered-Skipper; tropical influence; vagrant",142:"Brown; LONG streamer tails; NOT iridescent (unlike Great Purple)",143:"Orange-brown; POWDERY gray scaling on ventral HW; vagrant from desert",144:"Like Funereal but LACKS white HW fringe; dark throughout; Zarucco relative",145:"EXTIRPATED; lupine specialist; dark with white spots; Persius Duskywing",146:"HISTORIC; massive skipper (2+ in.); yucca borer larva; Giant-Skipper",147:"Dark brown; SALT-SCRUB specialist; coastal sage scrub; very local",148:"Orange; CRISP clean ventral chevrons; foothill chaparral; one brood; Lindsey's Skipper"};

// Lazy-loaded CC-licensed photo from iNaturalist taxa API
const photoCache = {};
function SpeciesPhoto({ species }) {
  const [photo, setPhoto] = useState(photoCache[species.id] || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (photoCache[species.id]) { setPhoto(photoCache[species.id]); setError(false); return; }
    if (photo && photo.speciesId === species.id) return;
    let cancelled = false;
    setLoading(true); setError(false);
    // Use genus+species (first two words) for search
    const sciParts = species.scientific.split(" ");
    const query = sciParts.length >= 2 ? sciParts[0]+" "+sciParts[1] : species.scientific;
    fetch("https://api.inaturalist.org/v1/taxa/autocomplete?q="+encodeURIComponent(query)+"&per_page=3&rank=species,subspecies")
      .then(r => { if(!r.ok) throw new Error("API error"); return r.json(); })
      .then(data => {
        if (cancelled) return;
        // Find best match
        const match = data.results?.find(t => {
          const tn = t.name?.toLowerCase() || "";
          return tn === query.toLowerCase() || tn.startsWith(query.toLowerCase());
        }) || data.results?.[0];
        if (match?.default_photo?.medium_url) {
          const p = {
            speciesId: species.id,
            url: match.default_photo.medium_url,
            attribution: match.default_photo.attribution || "Photo via iNaturalist",
            license: match.default_photo.license_code || "CC",
            square: match.default_photo.square_url,
            inatId: match.id,
            inatName: match.name,
          };
          photoCache[species.id] = p;
          setPhoto(p);
        } else { setError(true); }
        setLoading(false);
      })
      .catch(() => { if(!cancelled){setError(true);setLoading(false);} });
    return () => { cancelled = true; };
  }, [species.id, species.scientific]);

  if (loading) return (
    <div style={{textAlign:"center",padding:"12px 0",color:"#a09880",fontSize:12,fontStyle:"italic"}}>
      Loading photo...
    </div>
  );
  if (error || !photo) return null;

  return (
    <div style={{textAlign:"center",margin:"8px 0"}}>
      <div style={{position:"relative",display:"inline-block",borderRadius:6,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.12)",border:"1px solid #ddd5c5",maxWidth:"100%"}}>
        <img
          src={photo.url}
          alt={species.name+" — "+species.scientific}
          style={{display:"block",maxWidth:"100%",width:"auto",maxHeight:240,objectFit:"cover",background:"#f5f0e6"}}
          loading="lazy"
          onError={(e)=>{e.target.style.display="none";}}
        />
      </div>
      <div style={{fontSize:9,color:"#a09880",fontFamily:"'EB Garamond',Georgia,serif",marginTop:4,lineHeight:1.3,maxWidth:300,margin:"4px auto 0",padding:"0 8px"}}>
        <span style={{opacity:.7}}>{photo.attribution}</span>
        {photo.license && <span style={{marginLeft:4,padding:"1px 4px",borderRadius:3,fontSize:8,background:"#eee8d8",color:"#8a8570"}}>{photo.license.toUpperCase()}</span>}
        {photo.inatId && <a href={"https://www.inaturalist.org/taxa/"+photo.inatId} target="_blank" rel="noopener noreferrer" style={{marginLeft:4,fontSize:8,color:"#4A7C59",textDecoration:"none"}}>iNat ↗</a>}
      </div>
    </div>
  );
}

// Status classification criteria
const STATUS_CRITERIA = {
  common: {label:"Common", desc:"Regularly encountered in appropriate habitat during flight season. Multiple broods or extended flight period. Widespread across several ecological zones. Typically 50+ iNaturalist research-grade observations in LA County."},
  uncommon: {label:"Uncommon", desc:"Present but not reliably found without targeted searching. May be locally common in specific habitats but absent elsewhere. Typically 10–50 iNaturalist research-grade observations in LA County."},
  rare: {label:"Rare", desc:"Few records per year; requires specific habitat, host plant, or seasonal conditions. Often restricted to one or two ecological zones. Typically fewer than 10 iNaturalist research-grade observations in LA County."},
  endangered: {label:"Endangered", desc:"Federally or state-listed, or functionally imperiled. Extremely restricted range (often a single site), critically low population, and/or dependent on threatened habitat. Active conservation management in place or needed."},
  vagrant: {label:"Vagrant", desc:"Not a regular resident. Appears irregularly, sometimes years apart, typically as strays from desert, tropical Mexico, or other adjacent regions during irruptive events or favorable winds. No established breeding population in LA County."},
  extirpated: {label:"Extirpated", desc:"Historically documented in LA County with reliable specimen or photographic records, but no confirmed sightings in recent decades. Habitat loss (urbanization, agriculture) is the primary cause. Could theoretically recolonize if habitat is restored."},
  historical: {label:"Historical", desc:"Old literature records or specimen labels reference LA County, but records may be questionable, based on outdated taxonomy, or represent populations lost so long ago that recolonization is implausible. Included for completeness."},
};

function StatusBadge({ status, onClick }) {
  return <span onClick={(e)=>{e.stopPropagation(); if(onClick) onClick();}} style={{ display:"inline-block", padding:"2px 8px", borderRadius:20, fontSize:10, fontFamily:"'EB Garamond',Georgia,serif", fontWeight:600, letterSpacing:"0.05em", color:"#fff", backgroundColor:STATUS_COLORS[status], textTransform:"uppercase", cursor: onClick ? "help" : "default" }}>{STATUS_LABELS[status]}</span>;
}

function LifeListBadge({ observed }) {
  return observed
    ? <span style={{ display:"inline-flex", alignItems:"center", gap:3, padding:"2px 8px", borderRadius:20, fontSize:10, fontFamily:"'EB Garamond',Georgia,serif", fontWeight:700, color:"#fff", background:"linear-gradient(135deg,#4A7C59,#2d5a3a)" }}>✓ Observed</span>
    : <span style={{ display:"inline-flex", alignItems:"center", gap:3, padding:"2px 8px", borderRadius:20, fontSize:10, fontFamily:"'EB Garamond',Georgia,serif", fontWeight:600, color:"#C44536", border:"1px dashed #C44536", background:"rgba(196,69,54,0.06)" }}>◎ Target</span>;
}

export default function ButterflyFieldGuide() {
  const [selectedId, setSelectedId] = useState(null);
  const [familyFilter, setFamilyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showIntro, setShowIntro] = useState(true);
  const [showStatusLegend, setShowStatusLegend] = useState(false);
  // iNaturalist
  const [inatUser, setInatUser] = useState("");
  const [inatInput, setInatInput] = useState("");
  const [inatError, setInatError] = useState("");
  const [observedSpecies, setObservedSpecies] = useState(new Set());
  const [inatExtraSpecies, setInatExtraSpecies] = useState([]);
  const [showLifeList, setShowLifeList] = useState(false);
  const [lifeListFilter, setLifeListFilter] = useState("all"); // all | observed | target
  const [mobileDetail, setMobileDetail] = useState(false);
  const [winW, setWinW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const isMobile = winW < 768;

  // Track window size for responsive layout
  useEffect(() => {
    const h = () => setWinW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const handleSelectSpecies = useCallback((id) => {
    setSelectedId(id);
    if (winW < 768) setMobileDetail(true);
  }, [winW]);

  const LA_COUNTY_PLACE_ID = 962;
  const BUTTERFLY_TAXON_ID = 47224;
  const [inatMode, setInatMode] = useState("input"); // input | loading | paste | done

  const getInatUrl = (user) => `https://www.inaturalist.org/observations?user_id=${encodeURIComponent(user)}&place_id=${LA_COUNTY_PLACE_ID}&taxon_id=${BUTTERFLY_TAXON_ID}&view=species&verifiable=any`;

  const matchSpecies = useCallback((speciesNames) => {
    const matched = new Set();
    const extras = [];
    for (const entry of speciesNames) {
      const name = (entry.name || (typeof entry === "string" ? entry : "")).toLowerCase().trim();
      const sci = (entry.scientific || "").toLowerCase().trim();
      if (!name && !sci) continue;
      let found = false;
      for (const b of BUTTERFLIES) {
        const bParts = b.scientific.split(" ");
        const bShort = bParts.length >= 2 ? `${bParts[0]} ${bParts[1]}`.toLowerCase() : b.scientific.toLowerCase();
        const bName = b.name.toLowerCase();
        if (
          (sci && (bShort === sci.split(" ").slice(0,2).join(" ") || b.scientific.toLowerCase().startsWith(sci))) ||
          bName === name ||
          (name.length > 4 && (bName.includes(name) || name.includes(bName)))
        ) {
          matched.add(b.id);
          found = true;
          break;
        }
      }
      if (!found && (name.length > 2 || sci.length > 2)) {
        extras.push({ name: entry.name || entry, scientific: entry.scientific || "", count: entry.count || 0 });
      }
    }
    return { matched, extras };
  }, []);

  const fetchInatData = useCallback(async () => {
    if (!inatInput.trim()) return;
    setInatError("");
    setObservedSpecies(new Set());
    setInatExtraSpecies([]);
    setInatMode("loading");
    try {
      const url = `https://api.inaturalist.org/v1/observations/species_counts?user_id=${encodeURIComponent(inatInput.trim())}&place_id=${LA_COUNTY_PLACE_ID}&taxon_id=${BUTTERFLY_TAXON_ID}&per_page=500`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`API returned ${resp.status}`);
      const data = await resp.json();
      if (!data.results || data.results.length === 0) {
        setInatError("No butterfly observations found for this user in LA County. Check username.");
        setInatMode("input");
        return;
      }
      const entries = data.results.map(r => ({
        name: r.taxon?.preferred_common_name || r.taxon?.name || "",
        scientific: r.taxon?.name || "",
        count: r.count
      }));
      const { matched, extras } = matchSpecies(entries);
      setObservedSpecies(matched);
      setInatExtraSpecies(extras);
      setInatUser(inatInput.trim());
      setShowLifeList(true);
      setInatMode("done");
    } catch (e) {
      // API failed — offer paste fallback
      setInatError("Could not reach iNaturalist API. You can paste species names manually instead.");
      setInatMode("paste");
    }
  }, [inatInput, matchSpecies]);

  const [pasteText, setPasteText] = useState("");
  const handlePaste = useCallback(() => {
    if (!pasteText.trim()) return;
    const lines = pasteText.split("\n").map(l => l.trim()).filter(l => l.length > 2);
    const entries = lines.map(l => {
      const parenMatch = l.match(/^(.+?)\s*[\(](.+?)[\)]\s*$/);
      if (parenMatch) return { name: parenMatch[1].trim(), scientific: parenMatch[2].trim() };
      if (/^[A-Z][a-z]+ [a-z]+/.test(l)) return { name: "", scientific: l };
      return { name: l, scientific: "" };
    });
    const { matched, extras } = matchSpecies(entries);
    setObservedSpecies(matched);
    setInatExtraSpecies(extras);
    setInatUser(inatInput.trim() || "user");
    setShowLifeList(true);
    setInatMode("done");
  }, [pasteText, inatInput, matchSpecies]);

  const filtered = useMemo(() => {
    let list = BUTTERFLIES.filter(b => {
      if (familyFilter !== "all" && b.family !== familyFilter) return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        return b.name.toLowerCase().includes(s) || b.scientific.toLowerCase().includes(s);
      }
      return true;
    });
    if (showLifeList && lifeListFilter === "observed") list = list.filter(b => observedSpecies.has(b.id));
    if (showLifeList && lifeListFilter === "target") list = list.filter(b => !observedSpecies.has(b.id));
    return list;
  }, [familyFilter, statusFilter, searchTerm, showLifeList, lifeListFilter, observedSpecies]);

  const selectedSpecies = BUTTERFLIES.find(b => b.id === selectedId) || null;
  const familyCounts = useMemo(() => { const c={}; BUTTERFLIES.forEach(b=>{c[b.family]=(c[b.family]||0)+1}); return c; },[]);
  const statusCounts = useMemo(() => { const c={}; BUTTERFLIES.forEach(b=>{c[b.status]=(c[b.status]||0)+1}); return c; },[]);

  const lifeListStats = useMemo(() => {
    if (!showLifeList) return null;
    const total = BUTTERFLIES.length;
    const obs = observedSpecies.size;
    const pct = Math.round((obs/total)*100);
    const byFamily = {};
    Object.keys(FAMILIES).forEach(f => {
      const fam = BUTTERFLIES.filter(b=>b.family===f);
      const famObs = fam.filter(b=>observedSpecies.has(b.id)).length;
      byFamily[f] = { total:fam.length, observed:famObs };
    });
    return { total, obs, pct, byFamily, extras: inatExtraSpecies.length };
  }, [showLifeList, observedSpecies, inatExtraSpecies]);

  if (showIntro) {
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(170deg,#f5f0e6 0%,#ede7d8 50%,#e8e0cd 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'EB Garamond',Georgia,serif" }}>
        <div style={{ maxWidth:640, padding:"40px 28px", textAlign:"center" }}>
          <div style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.3em", color:"#9a9280", marginBottom:16 }}>A Naturalist's Compendium</div>
          <h1 style={{ fontSize:42, fontWeight:700, color:"#2a2a1e", margin:0, lineHeight:1.1 }}>Butterflies of<br/>Los Angeles County</h1>
          <div style={{ width:60, height:2, background:"#BFA46E", margin:"20px auto" }} />
          <p style={{ fontSize:16, color:"#5a5540", lineHeight:1.7, maxWidth:480, margin:"0 auto 8px" }}>
            An interactive field guide to {BUTTERFLIES.length} species documented across the county's remarkable habitats — from coastal dunes and urban gardens to mountain chaparral and high-desert scrub.
          </p>
          <p style={{ fontSize:13, color:"#8a8570", lineHeight:1.6, maxWidth:480, margin:"0 auto 12px" }}>
            The comprehensive county checklist (~144 species per Arroyos & Foothills Conservancy) includes subspecific splits and single-record vagrants. This guide covers {BUTTERFLIES.length} species at the species level: all regularly occurring taxa, key rarities, vagrant/irregular visitors, and extirpated or historic-only records for full ecological context.
          </p>
          <p style={{ fontSize:13, color:"#6a7a6a", lineHeight:1.6, maxWidth:460, margin:"0 auto 24px", fontWeight:600 }}>
            NEW: Connect your iNaturalist account to build a personal life list with target species for your next field trip.
          </p>
          <div style={{ display:"flex", justifyContent:"center", gap:10, flexWrap:"wrap", marginBottom:24 }}>
            {Object.entries(FAMILIES).map(([key,fam])=>(
              <span key={key} style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, border:`1px solid ${fam.color}55`, color:fam.color, fontWeight:600 }}>{fam.common} ({familyCounts[key]||0})</span>
            ))}
          </div>
          <button onClick={()=>setShowIntro(false)} style={{ padding:"12px 36px", borderRadius:30, background:"linear-gradient(135deg,#4A7C59,#2d5a3a)", color:"#fff", border:"none", cursor:"pointer", fontFamily:"'EB Garamond',Georgia,serif", fontSize:15, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", boxShadow:"0 4px 16px rgba(45,90,58,0.25)" }}>
            Open Field Guide
          </button>
          <div style={{ fontSize:11, color:"#b0a890", marginTop:20, fontStyle:"italic" }}>Sources: BAMONA / NHM Los Angeles, USFWS, iNaturalist, Southern California Butterflies, Arroyos & Foothills Conservancy</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#f5f0e6", fontFamily:"'EB Garamond',Georgia,serif" }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#2a2a1e,#3a3a2e)", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <div>
          <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.25em", color:"#BFA46E", marginBottom:1 }}>Field Guide</div>
          <div style={{ fontSize:20, fontWeight:700, color:"#f5f0e6" }}>Butterflies of Los Angeles County</div>
        </div>
        <div style={{ fontSize:12, color:"#a09880" }}>{BUTTERFLIES.length} species · 6 families</div>
      </div>

      {/* iNaturalist Bar */}
      <div style={{ padding:"8px 16px", background:"linear-gradient(135deg,#e8f0e8,#eee8d8)", borderBottom:"1px solid #ccc5b0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <span style={{ fontSize:12, fontWeight:700, color:"#4A7C59" }}>🦋 iNat Life List</span>
          {(inatMode === "input" || inatMode === "loading") && (<>
            <input type="text" placeholder="iNat username..." value={inatInput} onChange={e=>setInatInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")fetchInatData()}} style={{ padding:"5px 12px", borderRadius:20, border:"1px solid #aab8a0", fontSize:13, fontFamily:"'EB Garamond',Georgia,serif", background:"#fff", outline:"none", flex:"1 1 120px", maxWidth:200, minWidth:100 }} />
            <button onClick={fetchInatData} disabled={inatMode==="loading" || !inatInput.trim()} style={{ padding:"5px 14px", borderRadius:20, background:(inatMode==="loading"||!inatInput.trim())?"#aaa":"#4A7C59", color:"#fff", border:"none", fontSize:11, fontWeight:700, cursor:(inatMode==="loading"||!inatInput.trim())?"default":"pointer", fontFamily:"'EB Garamond',Georgia,serif", textTransform:"uppercase", letterSpacing:"0.08em", whiteSpace:"nowrap" }}>
              {inatMode==="loading" ? "Loading..." : "Connect"}
            </button>
          </>)}
          {inatMode === "paste" && (
            <span style={{ fontSize:11, color:"#5a5540", flex:"1 1 auto" }}>
              <a href={getInatUrl(inatInput.trim())} target="_blank" rel="noopener noreferrer" style={{ color:"#4A7C59", fontWeight:700, textDecoration:"underline" }}>
                Open @{inatInput.trim()}'s list ↗
              </a>
              {" → copy names → paste below"}
            </span>
          )}
          {inatError && <div style={{ fontSize:11, color:"#C44536", width:"100%", marginTop:2 }}>{inatError}</div>}
          {inatMode === "done" && showLifeList && lifeListStats && (
            <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:"auto", flexWrap:"wrap" }}>
              <span style={{ fontSize:12, color:"#2d5a3a", fontWeight:700 }}>@{inatUser}: {lifeListStats.obs}/{lifeListStats.total} ({lifeListStats.pct}%)</span>
              <div style={{ width:80, height:6, borderRadius:3, background:"#ddd5c2", overflow:"hidden" }}>
                <div style={{ width:`${lifeListStats.pct}%`, height:"100%", background:"linear-gradient(90deg,#4A7C59,#6aad7a)", borderRadius:3, transition:"width 0.5s" }} />
              </div>
              {lifeListStats.extras > 0 && <span style={{ fontSize:11, color:"#8a8570" }}>+{lifeListStats.extras} extra</span>}
              <button onClick={()=>{setShowLifeList(false);setObservedSpecies(new Set());setInatUser("");setInatInput("");setInatExtraSpecies([]);setInatMode("input");setPasteText("");setInatError("");}} style={{ padding:"3px 10px", borderRadius:20, fontSize:10, border:"1px solid #C44536", color:"#C44536", background:"transparent", cursor:"pointer", fontFamily:"'EB Garamond',Georgia,serif" }}>Clear</button>
            </div>
          )}
        </div>
        {inatMode === "paste" && (
          <div style={{ marginTop:8 }}>
            <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
              <textarea value={pasteText} onChange={e=>setPasteText(e.target.value)} placeholder={"Gulf Fritillary\nWest Coast Lady\nCabbage White\n..."} rows={4} style={{ flex:1, padding:"8px 12px", borderRadius:8, border:"1px solid #aab8a0", fontSize:13, fontFamily:"'EB Garamond',Georgia,serif", background:"#fff", outline:"none", resize:"vertical", lineHeight:1.5 }} />
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <button onClick={handlePaste} disabled={!pasteText.trim()} style={{ padding:"10px 16px", borderRadius:20, background:pasteText.trim()?"#4A7C59":"#ccc", color:"#fff", border:"none", fontSize:12, fontWeight:700, cursor:pasteText.trim()?"pointer":"default", fontFamily:"'EB Garamond',Georgia,serif" }}>Match</button>
                <button onClick={()=>{setInatMode("input");setInatError("");setPasteText("");}} style={{ padding:"4px 12px", borderRadius:20, fontSize:10, border:"1px solid #8a8570", color:"#8a8570", background:"transparent", cursor:"pointer", fontFamily:"'EB Garamond',Georgia,serif" }}>Back</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ padding:"8px 20px", background:"#eee8d8", borderBottom:"1px solid #ddd5c2", display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
        <input type="text" placeholder="Search species..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={{ padding:"5px 12px", borderRadius:20, border:"1px solid #ccc5b0", fontSize:12, fontFamily:"'EB Garamond',Georgia,serif", background:"#fff", outline:"none", width:160 }} />
        <select value={familyFilter} onChange={e=>setFamilyFilter(e.target.value)} style={{ padding:"5px 10px", borderRadius:20, border:"1px solid #ccc5b0", fontSize:12, fontFamily:"'EB Garamond',Georgia,serif", background:"#fff", cursor:"pointer" }}>
          <option value="all">All Families ({BUTTERFLIES.length})</option>
          {Object.entries(FAMILIES).map(([k,f])=>(<option key={k} value={k}>{f.common} ({familyCounts[k]||0})</option>))}
        </select>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ padding:"5px 10px", borderRadius:20, border:"1px solid #ccc5b0", fontSize:12, fontFamily:"'EB Garamond',Georgia,serif", background:"#fff", cursor:"pointer" }}>
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([k,l])=>(<option key={k} value={k}>{l} ({statusCounts[k]||0})</option>))}
        </select>
        {showLifeList && (
          <select value={lifeListFilter} onChange={e=>setLifeListFilter(e.target.value)} style={{ padding:"5px 10px", borderRadius:20, border:"1px solid #4A7C59", fontSize:12, fontFamily:"'EB Garamond',Georgia,serif", background:"#e8f0e8", cursor:"pointer", fontWeight:600, color:"#2d5a3a" }}>
            <option value="all">All ({BUTTERFLIES.length})</option>
            <option value="observed">✓ Observed ({observedSpecies.size})</option>
            <option value="target">◎ Targets ({BUTTERFLIES.length - observedSpecies.size})</option>
          </select>
        )}
        <span style={{ fontSize:11, color:"#8a8570", marginLeft:"auto" }}>Showing {filtered.length}</span>
      </div>

      {/* Life List Summary Panel — clickable family filters */}
      {showLifeList && lifeListStats && !searchTerm && statusFilter === "all" && (
        <div style={{ padding:"10px 16px", background:"#f0f6f0", borderBottom:"1px solid #c8d8c0", display:"flex", gap:12, flexWrap:"wrap", alignItems:"center", justifyContent:"center" }}>
          {Object.entries(FAMILIES).map(([k,fam]) => {
            const s = lifeListStats.byFamily[k];
            const pct = s.total > 0 ? Math.round((s.observed/s.total)*100) : 0;
            const isActive = familyFilter === k;
            return (
              <div key={k} onClick={()=>setFamilyFilter(isActive ? "all" : k)} style={{
                textAlign:"center", minWidth:76, padding:"6px 8px", borderRadius:8, cursor:"pointer",
                background: isActive ? fam.color+"18" : "transparent",
                border: isActive ? `2px solid ${fam.color}` : "2px solid transparent",
                transition:"all 0.15s",
              }}>
                <div style={{ fontSize:10, color:fam.color, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" }}>{fam.common.split(" ")[0]}</div>
                <div style={{ fontSize:16, fontWeight:700, color:"#2a2a1e" }}>{s.observed}<span style={{ fontSize:11, color:"#8a8570" }}>/{s.total}</span></div>
                <div style={{ width:56, height:4, borderRadius:2, background:"#ddd5c2", margin:"3px auto 0", overflow:"hidden" }}>
                  <div style={{ width:`${pct}%`, height:"100%", background:fam.color, borderRadius:2 }} />
                </div>
              </div>
            );
          })}
          {familyFilter !== "all" && (
            <div onClick={()=>setFamilyFilter("all")} style={{ fontSize:11, color:"#8a8570", cursor:"pointer", padding:"4px 10px", borderRadius:16, border:"1px solid #c8c0b0", background:"#fff" }}>
              Show all ×
            </div>
          )}
        </div>
      )}

      {/* Main layout */}
      <div style={{ display:"flex", minHeight:"calc(100vh - 160px)", flexDirection: isMobile ? "column" : "row" }}>
        {/* Species list — hidden on mobile when detail is shown */}
        {(!isMobile || !mobileDetail) && (
        <div style={{ width: isMobile ? "100%" : 360, minWidth: isMobile ? "auto" : 300, borderRight: isMobile ? "none" : "1px solid #ddd5c5", overflowY:"auto", padding:"12px 12px", maxHeight: isMobile ? "none" : "calc(100vh - 160px)", background:"#faf7ef" }}>
          {filtered.length === 0 ? (
            <div style={{ padding:20, textAlign:"center", color:"#a09880", fontStyle:"italic" }}>No species match</div>
          ) : filtered.map(sp => {
            const fam = FAMILIES[sp.family];
            const isObs = observedSpecies.has(sp.id);
            const isSel = selectedId === sp.id;
            const isGhost = sp.status === "extirpated" || sp.status === "historical";
            return (
              <div key={sp.id} onClick={()=>handleSelectSpecies(sp.id)} style={{
                cursor:"pointer",
                border: `${isSel ? 2.5 : 1.5}px solid ${isGhost ? "#ccc5b5" : fam.color}`,
                borderRadius:6, padding:"10px 12px", marginBottom:8,
                backgroundColor: isObs && showLifeList ? "#f0f8f0" : isSel ? "#fdfbf5" : isGhost ? "#f8f6f2" : "#fff",
                opacity: isGhost ? 0.8 : 1,
                transition:"all 0.15s", boxShadow:isSel?`0 2px 12px ${fam.color}30`:"none",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:6 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:700, color: isGhost ? "#7a7a6e" : "#2a2a1e", lineHeight:1.2 }}>{isGhost ? "† " : ""}{sp.name}</div>
                    <div style={{ fontSize:12, fontStyle:"italic", color:"#7a7560", marginTop:1 }}>{sp.scientific}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:3, alignItems:"flex-end" }}>
                    <StatusBadge status={sp.status} onClick={()=>setShowStatusLegend(true)} />
                    {showLifeList && <LifeListBadge observed={isObs} />}
                  </div>
                </div>
                <div style={{ display:"flex", gap:12, marginTop:5, fontSize:11, color:"#6a6550" }}>
                  <span>✦ {sp.wingspan}</span><span>⟡ {sp.flight}</span>
                </div>
              </div>
            );
          })}
          {/* Extra iNat species not in guide */}
          {showLifeList && inatExtraSpecies.length > 0 && lifeListFilter !== "target" && (
            <div style={{ marginTop:16, padding:12, background:"#f5f0e6", borderRadius:6, border:"1px dashed #ccc5b0" }}>
              <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em", color:"#9a9280", fontWeight:700, marginBottom:8 }}>
                Additional species observed in county ({inatExtraSpecies.length})
              </div>
              <div style={{ fontSize:11, color:"#6a6550", lineHeight:1.5 }}>
                These species were in your iNat records but not in this field guide (may include moths, subspecific records, or taxa outside guide scope):
              </div>
              {inatExtraSpecies.map((sp,i) => (
                <div key={i} style={{ fontSize:12, color:"#4a4a3a", padding:"3px 0", borderBottom:"1px solid #e8e0cd" }}>
                  <strong>{sp.name}</strong> <span style={{ fontStyle:"italic", color:"#7a7560" }}>{sp.scientific}</span> <span style={{ color:"#9a9280" }}>({sp.count} obs)</span>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Detail panel — on mobile, shown only when a species is selected */}
        {(!isMobile || mobileDetail) && (
        <div style={{ flex:1, overflowY:"auto", maxHeight: isMobile ? "none" : "calc(100vh - 160px)", background:"#fff" }}>
          {isMobile && mobileDetail && (
            <button onClick={()=>setMobileDetail(false)} style={{ display:"flex", alignItems:"center", gap:4, padding:"10px 16px", background:"#eee8d8", border:"none", borderBottom:"1px solid #ddd5c5", width:"100%", cursor:"pointer", fontFamily:"'EB Garamond',Georgia,serif", fontSize:13, color:"#4A7C59", fontWeight:700 }}>
              ← Back to species list
            </button>
          )}
          {!selectedSpecies ? (
            <div style={{ padding:40, textAlign:"center", color:"#b0a890", fontSize:17, fontStyle:"italic" }}>Select a species to view details and range map</div>
          ) : (() => {
            const fam = FAMILIES[selectedSpecies.family];
            const isObs = observedSpecies.has(selectedSpecies.id);
            return (
              <div>
                <div style={{ background:`linear-gradient(135deg,${fam.color}22,${fam.color}08)`, borderBottom:`2px solid ${fam.color}44`, padding:"16px 20px", borderRadius:"6px 6px 0 0" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                    <span style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.15em", color:fam.color, fontWeight:700 }}>{fam.name} — {fam.common}</span>
                  </div>
                  <h2 style={{ fontSize:26, fontWeight:700, margin:0, color:"#1e1e14" }}>{selectedSpecies.name}</h2>
                  <div style={{ fontSize:15, fontStyle:"italic", color:"#5a5540", marginTop:2 }}>{selectedSpecies.scientific}</div>
                  <div style={{ marginTop:6, display:"flex", gap:6, alignItems:"center" }}>
                    <StatusBadge status={selectedSpecies.status} onClick={()=>setShowStatusLegend(true)} />
                    {showLifeList && <LifeListBadge observed={isObs} />}
                  </div>
                </div>
                <div style={{ padding:"16px 20px" }}>
                  {/* Reference Photo + Field Marks */}
                  <SpeciesPhoto species={selectedSpecies} />
                  {FIELD_MARKS[selectedSpecies.id] && (
                    <div style={{ background:"#faf8f2", border:"1px solid #e0d8c5", borderRadius:6, padding:"10px 14px", marginBottom:14 }}>
                      <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:"#9a9280", fontWeight:700, marginBottom:6 }}>Field Marks for Identification</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                        {FIELD_MARKS[selectedSpecies.id].split(";").map((mark,i) => {
                          const m = mark.trim();
                          if (!m) return null;
                          return <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:20, fontSize:12, fontFamily:"'EB Garamond',Georgia,serif", background:"#fff", border:"1px solid #d8d0c0", color:"#3a3428" }}>
                            <span style={{ color:"#C44536", fontWeight:700, fontSize:10 }}>→</span> {m}
                          </span>;
                        })}
                      </div>
                    </div>
                  )}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 16px", marginBottom:16 }}>
                    {[{l:"Wingspan",v:selectedSpecies.wingspan},{l:"Flight Season",v:selectedSpecies.flight},{l:"Host Plants",v:selectedSpecies.hostPlants},{l:"Habitat",v:selectedSpecies.habitat}].map(item=>(
                      <div key={item.l}>
                        <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:"#9a9280", fontWeight:700, marginBottom:1 }}>{item.l}</div>
                        <div style={{ fontSize:12, color:"#3a3a2e", lineHeight:1.4 }}>{item.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ backgroundColor:"#faf7ef", border:"1px solid #e8e0cd", borderRadius:6, padding:"12px 14px", marginBottom:16 }}>
                    <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:"#9a9280", fontWeight:700, marginBottom:4 }}>Field Notes</div>
                    <div style={{ fontSize:13, color:"#3a3a2e", lineHeight:1.6 }}>{selectedSpecies.notes}</div>
                  </div>
                  {showLifeList && !isObs && (
                    <div style={{ backgroundColor:"#fef5f0", border:"1px solid #e8c0b0", borderRadius:6, padding:"12px 14px", marginBottom:16 }}>
                      <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:"#C44536", fontWeight:700, marginBottom:4 }}>◎ Target Species</div>
                      <div style={{ fontSize:12, color:"#5a3a2e", lineHeight:1.5 }}>
                        You haven't recorded this species in LA County yet.
                        {selectedSpecies.status === "common" && " This is a common species — check gardens and parks during the flight season."}
                        {selectedSpecies.status === "uncommon" && " Look for it in appropriate habitat during peak flight season."}
                        {selectedSpecies.status === "rare" && " This is a rare species requiring targeted effort and good timing."}
                        {selectedSpecies.status === "endangered" && " This species is federally protected. Observe from designated viewing areas only."}
                        {selectedSpecies.status === "vagrant" && " An irregular visitor — requires luck and vigilance during irruption years."}
                        {selectedSpecies.status === "extirpated" && " This species is no longer found in LA County. Included for historical context only."}
                        {selectedSpecies.status === "historical" && " This species has only historical records from the county and is no longer expected to occur."}
                        {!["extirpated","historical"].includes(selectedSpecies.status) && (" Best zones: " + selectedSpecies.zones.map(z=>ZONE_NAMES[z].split("/")[0].trim()).join(", ") + ".")}
                      </div>
                    </div>
                  )}
                  {(selectedSpecies.status === "extirpated" || selectedSpecies.status === "historical") && (
                    <div style={{ backgroundColor:"#f5f0ea", border:"1px solid #d5cdb8", borderRadius:6, padding:"12px 14px", marginBottom:16 }}>
                      <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:selectedSpecies.status === "extirpated" ? "#666" : "#999", fontWeight:700, marginBottom:4 }}>
                        {selectedSpecies.status === "extirpated" ? "⊘ Extirpated from County" : "◷ Historical Record Only"}
                      </div>
                      <div style={{ fontSize:12, color:"#4a4a3e", lineHeight:1.5 }}>
                        {selectedSpecies.status === "extirpated"
                          ? "This species was formerly resident in LA County but is no longer found here. Causes typically include habitat loss, urbanization, drought, or loss of host plants. Historical range zones shown on map below."
                          : "This species appears in historical county checklists (e.g., Emmel & Emmel 1973, Gunder 1930, Mattoni 1990) but has not been reliably confirmed in recent decades. Some records may represent misidentifications or transient strays that never established breeding populations."}
                      </div>
                    </div>
                  )}
                  {selectedSpecies.status === "vagrant" && (
                    <div style={{ backgroundColor:"#f0f0f8", border:"1px solid #c8c8d8", borderRadius:6, padding:"12px 14px", marginBottom:16 }}>
                      <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:"#7070A0", fontWeight:700, marginBottom:4 }}>↗ Vagrant / Irregular Visitor</div>
                      <div style={{ fontSize:12, color:"#4a4a52", lineHeight:1.5 }}>
                        This species does not maintain breeding populations in LA County. Records are from occasional strays, irruptions, or range overshoots — typically during warm years or strong desert monsoon events. Any sighting would be noteworthy and worth documenting on iNaturalist.
                      </div>
                    </div>
                  )}
                  <div style={{ border:"1px solid #e0d8c5", borderRadius:6, padding:14, backgroundColor:"#fdfcf8" }}>
                    <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.12em", color:"#9a9280", fontWeight:700, marginBottom:8 }}>County Range Map</div>
                    <RangeMap species={selectedSpecies} />
                    <div style={{ fontSize:10, color:"#8a8570", marginTop:6, lineHeight:1.4 }}>
                      Recorded in: {selectedSpecies.zones.map(z=>ZONE_NAMES[z]).join(" · ")}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
        )}
      </div>

      {/* Status Legend Modal */}
      {showStatusLegend && (
        <div onClick={()=>setShowStatusLegend(false)} style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div onClick={(e)=>e.stopPropagation()} style={{ background:"#faf7ef", borderRadius:12, maxWidth:480, width:"100%", maxHeight:"80vh", overflow:"auto", boxShadow:"0 8px 40px rgba(0,0,0,0.25)", border:"1px solid #e0d8c5" }}>
            <div style={{ padding:"20px 24px 12px", borderBottom:"1px solid #e8e0cd", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:20, fontWeight:700, color:"#2a2a1e" }}>Conservation Status Classifications</div>
              <div onClick={()=>setShowStatusLegend(false)} style={{ cursor:"pointer", fontSize:18, color:"#a09880", padding:"4px 8px", borderRadius:4 }}>✕</div>
            </div>
            <div style={{ padding:"16px 24px 24px" }}>
              <div style={{ fontSize:13, color:"#6a6550", marginBottom:16, lineHeight:1.5 }}>
                Status reflects current abundance and regularity in Los Angeles County, based on iNaturalist observation data, published surveys, and museum records. Tap any status badge in the guide to view this reference.
              </div>
              {Object.entries(STATUS_CRITERIA).map(([key, {label, desc}]) => (
                <div key={key} style={{ marginBottom:14, display:"flex", gap:12, alignItems:"flex-start" }}>
                  <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:20, fontSize:10, fontFamily:"'EB Garamond',Georgia,serif", fontWeight:600, letterSpacing:"0.05em", color:"#fff", backgroundColor:STATUS_COLORS[key], textTransform:"uppercase", flexShrink:0, marginTop:2 }}>{label}</span>
                  <div style={{ fontSize:13, color:"#3a3a2e", lineHeight:1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding:"12px 20px", background:"#eee8d8", borderTop:"1px solid #ddd5c2", fontSize:10, color:"#a09880", textAlign:"center" }}>
        <div style={{ fontStyle:"normal", fontWeight:600, fontSize:12, color:"#6a6550", marginBottom:4 }}>Field guide by Rhys Marsh</div>
        <div style={{ fontStyle:"italic" }}>
          Data: BAMONA, NHM of LA County, USFWS, iNaturalist, socalbutterflies.com, Emmel & Emmel (1973), Mattoni (1990), Davenport (2018). Range zones approximate. 
          Includes resident, rare, vagrant, extirpated, and historic-only records. The ~144 county total (Arroyos & Foothills) includes additional subspecific splits.
          iNaturalist data fetched via public API (place_id=962, taxon_id=47224). Photos are CC-licensed from iNaturalist contributors.
        </div>
      </div>
    </div>
  );
}
