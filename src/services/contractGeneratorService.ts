// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as vc from '@digitalbazaar/vc'
import { fetch } from '@inrupt/solid-client-authn-browser'
import {
  WebId,
  SolidDataset,
  buildThing,
  createSolidDataset,
  getStringNoLocale,
  getStringNoLocaleAll,
  getThing,
  getDate,
  getUrl,
  getUrlAll,
  setThing,
  createThing,
  getSolidDataset,
  saveSolidDatasetAt,
  universalAccess,
} from '@inrupt/solid-client'
import { RDF, SCHEMA_INRUPT } from '@inrupt/vocab-common-rdf'
import { OwnerContract, Credential, Presentation } from '../types/models'
import { issue, signPresentation, Suite } from '../services/cryptoService'

export default class Dogovor {
  get credential() {
    if (this._credential) {
      return this._credential as Credential
    }
    throw new Error('No credential data')
  }

  set presentation(presentation: Presentation) {
    this._presentation = presentation
  }

  get presentation() {
    if (this._presentation) {
      return this._presentation as Presentation
    }
    const ds = this.dataset
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const resource = ds.internal_resourceInfo.sourceIri as string
    const outputJSON = {}
    const credentialSubject = {}
    credentialSubject['agent'] = {
      name: getStringNoLocale(
        getThing(ds, resource + '#vcCredentialSubject'),
        'https://schema.org/agent#name',
      ),
      email: getStringNoLocale(
        getThing(ds, resource + '#vcCredentialSubject'),
        'https://schema.org/agent#email',
      ),
    }
    credentialSubject['instrument'] = {
      name: getStringNoLocale(
        getThing(ds, resource + '#vcCredentialSubject'),
        'https://schema.org/instrument#name',
      ),
      description:
        getStringNoLocale(
          getThing(ds, resource + '#vcCredentialSubject'),
          'https://schema.org/instrument#description',
        ) ?? null,
    }
    credentialSubject.startTime = getDate(
      getThing(ds, resource + '#vcCredentialSubject'),
      SCHEMA_INRUPT.startTime,
    ).toISOString()
    credentialSubject.endTime =
      getDate(
        getThing(ds, resource + '#vcCredentialSubject'),
        SCHEMA_INRUPT.endTime,
      )?.toISOString() ?? null
    credentialSubject.participant = {
      sameAs: getUrl(
        getThing(ds, resource + '#vcCredentialSubject'),
        'https://schema.org/participant#sameAs',
      ),
      email: getThing(ds, resource + '#vcCredentialSubject')
        ? getStringNoLocale(
            getThing(ds, resource + '#vcCredentialSubject'),
            'https://schema.org/participant#email',
          )
        : null,
      telephone: getThing(ds, resource + '#vcCredentialSubject')
        ? getStringNoLocale(
            getThing(ds, resource + '#vcCredentialSubject'),
            'https://schema.org/participant#telephone',
          )
        : null,
      url: getThing(ds, resource + '#vcCredentialSubject')
        ? getStringNoLocale(
            getThing(ds, resource + '#vcCredentialSubject'),
            'https://schema.org/participant#url',
          )
        : null,
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    credentialSubject.object = JSON.parse(
      getStringNoLocale(
        getThing(ds, resource + '#vcCredentialSubject'),
        SCHEMA_INRUPT.image,
      ),
    )
    credentialSubject.identifier = [
      {
        value: getStringNoLocale(
          getThing(ds, resource + '#vcCredentialSubject'),
          'https://schema.org/identifier#value',
        ),
        name: getStringNoLocale(
          getThing(ds, resource + '#vcCredentialSubject'),
          'https://schema.org/identifier#name',
        ),
      },
    ]
    outputJSON['@context'] = getUrlAll(
      getThing(ds, resource + '#presentationContext'),
      RDF.type,
    )
    outputJSON['type'] = getStringNoLocaleAll(
      getThing(ds, resource + '#presentationType'),
      RDF.type,
    )
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    outputJSON['proof'] = JSON.parse(
      getStringNoLocale(
        getThing(ds, resource + '#presentationProof'),
        'https://w3c.github.io/vc-data-integrity/vocab/security/vocabulary',
      ),
    )
    outputJSON['verifiableCredential'] = [
      {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        '@context': JSON.parse(
          getStringNoLocale(getThing(ds, resource + '#vcContext'), RDF.type),
        ),
        'id': getStringNoLocale(
          getThing(ds, resource + '#vcId'),
          'https://purl.org/dc/terms/id',
        ),
        'type': getStringNoLocaleAll(
          getThing(ds, resource + '#vcType'),
          RDF.type,
        ),
        'issuer': getStringNoLocale(
          getThing(ds, resource + '#vcIssuer'),
          'https://w3c.github.io/vc-data-model/#issuer',
        ),
        'issuanceDate': getDate(
          getThing(ds, resource + '#vcIssuanceDate'),
          'https://w3c.github.io/vc-data-model/#issuance-date',
        ).toISOString(),
        'credentialSubject': credentialSubject,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        'proof': JSON.parse(
          getStringNoLocale(
            getThing(ds, resource + '#vcProof'),
            'https://w3c.github.io/vc-data-integrity/vocab/security/vocabulary',
          ),
        ),
      },
    ]

    return outputJSON as Presentation
  }

  // Если вызвать метод sign два и более раза, то появляется Proof Chains
  async sign(suite: Suite) {
    this.presentation = await signPresentation({
      presentation: this.presentation,
      suite: suite,
    })
    this.updateDataset()
  }

  upload() {
    return saveSolidDatasetAt(this.resourceUrl as string, this.dataset, {
      fetch,
    })
  }

  // todo при шаринге делать ограничение на добавление только proof и комментариев
  shareLink(url: string, webId: WebId) {
    return universalAccess.setAgentAccess(
      url,
      webId,
      { read: true, append: true, write: true },
      {
        fetch,
      },
    )
  }

  get presentationContext() {
    return buildThing(
      createThing({ url: this.resourceUrl + '#presentationContext' }),
    )
      .addUrl(RDF.type, 'https://www.w3.org/2018/credentials/v1')
      .addUrl(RDF.type, 'https://w3id.org/security/suites/ed25519-2020/v1')
  }

  get presentationType() {
    return buildThing(
      createThing({ url: this.resourceUrl + '#presentationType' }),
    ).addStringNoLocale(RDF.type, 'VerifiablePresentation')
  }

  get vcContext() {
    return buildThing(
      createThing({ url: this.resourceUrl + '#vcContext' }),
    ).addStringNoLocale(
      RDF.type,
      JSON.stringify([
        'https://www.w3.org/2018/credentials/v1',
        {
          OrganizeAction: 'https://schema.org/OrganizeAction',
          agent: 'https://schema.org/agent',
          name: 'https://schema.org/name',
          email: 'https://schema.org/email',
          instrument: 'https://schema.org/instrument',
          description: 'https://schema.org/description',
          participant: 'https://schema.org/Person',
          identifier: 'https://schema.org/identifier',
          startTime: 'https://schema.org/startTime',
          endTime: 'https://schema.org/endTime',
          propertyID: 'https://schema.org/propertyID',
          value: 'https://schema.org/value',
          object: 'https://schema.org/ImageObject',
          encodingFormat: 'https://schema.org/encodingFormat',
          contentUrl: 'https://schema.org/contentUrl',
          telephone: 'https://schema.org/telephone',
          url: 'https://schema.org/url',
          sameAs: 'https://schema.org/sameAs',
        },
        'https://w3id.org/security/suites/ed25519-2020/v1',
      ]),
    )
  }

  get vcId() {
    return buildThing(
      createThing({ url: this.resourceUrl + '#vcId' }),
    ).addStringNoLocale('https://purl.org/dc/terms/id', this.credential.id)
  }

  get vcType() {
    return (
      buildThing(createThing({ url: this.resourceUrl + '#vcType' }))
        // todo - получить из this.credential.type
        .addStringNoLocale(RDF.type, 'VerifiableCredential')
        .addStringNoLocale(RDF.type, 'OrganizeAction')
    )
  }

  get vcIssuer() {
    return buildThing(
      createThing({ url: this.resourceUrl + '#vcIssuer' }),
    ).addStringNoLocale(
      'https://w3c.github.io/vc-data-model/#issuer',
      this.credential.issuer,
    )
  }

  get vcIssuanceDate() {
    return buildThing(
      createThing({ url: this.resourceUrl + '#vcIssuanceDate' }),
    ).addDate(
      'https://w3c.github.io/vc-data-model/#issuance-date',
      new Date(this.credential.issuanceDate),
    )
  }

  get vcProof() {
    return buildThing(
      createThing({ url: this.resourceUrl + '#vcProof' }),
    ).addStringNoLocale(
      'https://w3c.github.io/vc-data-integrity/vocab/security/vocabulary',
      JSON.stringify(this.credential.proof),
    )
  }

  get presentationProof() {
    const presentationProof = this.presentation.proof
    if (!presentationProof) {
      throw new Error('presentation not signed')
    }
    const thing = buildThing(
      createThing({ url: this.resourceUrl + '#presentationProof' }),
    )
    thing.addStringNoLocale(
      'https://w3c.github.io/vc-data-integrity/vocab/security/vocabulary',
      JSON.stringify(presentationProof),
    )
    return thing
  }

  get vcCredentialSubject() {
    // credentialSubject
    const credentialSubject = buildThing(
      createThing({
        url: this.resourceUrl + '#vcCredentialSubject',
      }),
    )
    // agent
    credentialSubject.addStringNoLocale(
      'https://schema.org/agent#name',
      this.credential.credentialSubject.agent.name,
    )
    credentialSubject.addStringNoLocale(
      'https://schema.org/agent#email',
      this.credential.credentialSubject.agent.email,
    )
    // Identifier
    for (const identifier of this.credential.credentialSubject.identifier) {
      credentialSubject.addStringNoLocale(
        'https://schema.org/identifier#name',
        identifier.name,
      )
      credentialSubject.addStringNoLocale(
        'https://schema.org/identifier#value',
        identifier.value,
      )
    }
    // Instrument
    if (this.credential.credentialSubject.instrument.description) {
      credentialSubject.addStringNoLocale(
        'https://schema.org/instrument#description',
        this.credential.credentialSubject.instrument.description,
      )
    }
    credentialSubject.addStringNoLocale(
      'https://schema.org/instrument#name',
      this.credential.credentialSubject.instrument.name,
    )
    // StartTime
    credentialSubject.addDate(
      SCHEMA_INRUPT.startTime,
      new Date(this.credential.credentialSubject.startTime),
    )
    // EndTime
    if (this.credential.credentialSubject.endTime) {
      credentialSubject.addDate(
        SCHEMA_INRUPT.endTime,
        new Date(this.credential.credentialSubject.endTime),
      )
    }
    // Participant
    credentialSubject.addUrl(
      'https://schema.org/participant#sameAs',
      this.credential.credentialSubject.participant.sameAs,
    )
    if (this.credential.credentialSubject.participant.email) {
      credentialSubject.addStringNoLocale(
        'https://schema.org/participant#email',
        this.credential.credentialSubject.participant.email,
      )
    }
    if (this.credential.credentialSubject.participant.telephone) {
      credentialSubject.addStringNoLocale(
        'https://schema.org/participant#telephone',
        this.credential.credentialSubject.participant.telephone,
      )
    }
    if (this.credential.credentialSubject.participant.url) {
      credentialSubject.addStringNoLocale(
        'https://schema.org/participant#url',
        this.credential.credentialSubject.participant.url,
      )
    }
    // Object
    credentialSubject.addStringNoLocale(
      SCHEMA_INRUPT.image,
      JSON.stringify(this.credential.credentialSubject.object),
    )

    return credentialSubject
  }

  updateDataset() {
    let ds = null as SolidDataset
    if (this._dataset) {
      ds = this._dataset as SolidDataset
    } else {
      ds = createSolidDataset()
    }

    ds = setThing(ds, this.presentationContext.build())
    ds = setThing(ds, this.presentationType.build())
    ds = setThing(ds, this.presentationProof.build())

    ds = setThing(ds, this.vcContext.build())
    ds = setThing(ds, this.vcId.build())
    ds = setThing(ds, this.vcType.build())
    ds = setThing(ds, this.vcIssuer.build())
    ds = setThing(ds, this.vcIssuanceDate.build())
    ds = setThing(ds, this.vcCredentialSubject.build())
    ds = setThing(ds, this.vcProof.build())

    this.dataset = ds
  }

  set dataset(ds: SolidDataset) {
    this._dataset = ds
  }

  get dataset() {
    if (this._dataset) {
      return this._dataset as SolidDataset
    } else {
      throw new Error('no dataset')
    }
  }

  static async fromCredential(
    url: string,
    credential: Credential,
    suite: Suite,
  ) {
    const dogovor = new Dogovor()
    dogovor.resourceUrl = url
    dogovor._credential = await issue({
      credential: credential,
      suite: suite,
    })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    dogovor.presentation = vc.createPresentation({
      verifiableCredential: [dogovor.credential],
    }) as Presentation
    await dogovor.sign(suite)

    return dogovor
  }

  static async fromUrl(resource: string) {
    const ds: SolidDataset = await getSolidDataset(resource, {
      fetch,
    })
    const dogovor = new Dogovor()
    dogovor.resourceUrl = resource
    dogovor.dataset = ds
    dogovor._credential = dogovor.presentation
      .verifiableCredential[0] as Credential

    return dogovor
  }

  static mintContract(contract: OwnerContract) {
    const dogovor = new Dogovor()
    dogovor._credential = {
      credentialSubject: {
        agent: contract?.agent,
        participant: contract?.participant,
        instrument: contract?.instrument,
        object: contract.files,
      },
    } as Credential

    return dogovor
  }
}
