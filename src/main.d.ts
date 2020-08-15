type Pacage = string 
type maybePacage = string | null 

enum isBio { Bio = 1, Conventionnel = 0 }

interface AgenceBioGeoJson {
    type: string,
    features: AgenceBioFeature[]
}

interface AgenceBioFeature {
    type: string,
    geometry: PointGeometry,
    properties: AgenceBioFeatureProperties
}

interface AgenceBioFeatureProperties {
    id: number,
    numerobio: number,
    pacage: maybePacage
    bio: isBio
}