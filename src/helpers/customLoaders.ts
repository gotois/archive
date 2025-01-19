const x = {
  document: {
    '@context': {
      '@version': 1.1,
      '@protected': true,
      'id': '@id',
      'type': '@type',
      'VerifiableCredential': {
        '@id': 'https://www.w3.org/2018/credentials#VerifiableCredential',
        '@context': {
          '@version': 1.1,
          '@protected': true,
          'id': '@id',
          'type': '@type',
          'cred': 'https://www.w3.org/2018/credentials#',
          'sec': 'https://w3id.org/security#',
          'xsd': 'http://www.w3.org/2001/XMLSchema#',
          'credentialSchema': {
            '@id': 'cred:credentialSchema',
            '@type': '@id',
            '@context': {
              '@version': 1.1,
              '@protected': true,
              'id': '@id',
              'type': '@type',
              'cred': 'https://www.w3.org/2018/credentials#',
              'JsonSchemaValidator2018': 'cred:JsonSchemaValidator2018',
            },
          },
          'credentialStatus': {
            '@id': 'cred:credentialStatus',
            '@type': '@id',
          },
          'credentialSubject': {
            '@id': 'cred:credentialSubject',
            '@type': '@id',
          },
          'evidence': {
            '@id': 'cred:evidence',
            '@type': '@id',
          },
          'expirationDate': {
            '@id': 'cred:expirationDate',
            '@type': 'xsd:dateTime',
          },
          'holder': {
            '@id': 'cred:holder',
            '@type': '@id',
          },
          'issued': {
            '@id': 'cred:issued',
            '@type': 'xsd:dateTime',
          },
          'issuer': {
            '@id': 'cred:issuer',
            '@type': '@id',
          },
          'issuanceDate': {
            '@id': 'cred:issuanceDate',
            '@type': 'xsd:dateTime',
          },
          'proof': {
            '@id': 'sec:proof',
            '@type': '@id',
            '@container': '@graph',
          },
          'refreshService': {
            '@id': 'cred:refreshService',
            '@type': '@id',
            '@context': {
              '@version': 1.1,
              '@protected': true,
              'id': '@id',
              'type': '@type',
              'cred': 'https://www.w3.org/2018/credentials#',
              'ManualRefreshService2018': 'cred:ManualRefreshService2018',
            },
          },
          'termsOfUse': {
            '@id': 'cred:termsOfUse',
            '@type': '@id',
          },
          'validFrom': {
            '@id': 'cred:validFrom',
            '@type': 'xsd:dateTime',
          },
          'validUntil': {
            '@id': 'cred:validUntil',
            '@type': 'xsd:dateTime',
          },
        },
      },
      'VerifiablePresentation': {
        '@id': 'https://www.w3.org/2018/credentials#VerifiablePresentation',
        '@context': {
          '@version': 1.1,
          '@protected': true,
          'id': '@id',
          'type': '@type',
          'cred': 'https://www.w3.org/2018/credentials#',
          'sec': 'https://w3id.org/security#',
          'holder': {
            '@id': 'cred:holder',
            '@type': '@id',
          },
          'proof': {
            '@id': 'sec:proof',
            '@type': '@id',
            '@container': '@graph',
          },
          'verifiableCredential': {
            '@id': 'cred:verifiableCredential',
            '@type': '@id',
            '@container': '@graph',
          },
        },
      },
      'EcdsaSecp256k1Signature2019': {
        '@id': 'https://w3id.org/security#EcdsaSecp256k1Signature2019',
        '@context': {
          '@version': 1.1,
          '@protected': true,
          'id': '@id',
          'type': '@type',
          'sec': 'https://w3id.org/security#',
          'xsd': 'http://www.w3.org/2001/XMLSchema#',
          'challenge': 'sec:challenge',
          'created': {
            '@id': 'http://purl.org/dc/terms/created',
            '@type': 'xsd:dateTime',
          },
          'domain': 'sec:domain',
          'expires': {
            '@id': 'sec:expiration',
            '@type': 'xsd:dateTime',
          },
          'jws': 'sec:jws',
          'nonce': 'sec:nonce',
          'proofPurpose': {
            '@id': 'sec:proofPurpose',
            '@type': '@vocab',
            '@context': {
              '@version': 1.1,
              '@protected': true,
              'id': '@id',
              'type': '@type',
              'sec': 'https://w3id.org/security#',
              'assertionMethod': {
                '@id': 'sec:assertionMethod',
                '@type': '@id',
                '@container': '@set',
              },
              'authentication': {
                '@id': 'sec:authenticationMethod',
                '@type': '@id',
                '@container': '@set',
              },
            },
          },
          'proofValue': 'sec:proofValue',
          'verificationMethod': {
            '@id': 'sec:verificationMethod',
            '@type': '@id',
          },
        },
      },
      'EcdsaSecp256r1Signature2019': {
        '@id': 'https://w3id.org/security#EcdsaSecp256r1Signature2019',
        '@context': {
          '@version': 1.1,
          '@protected': true,
          'id': '@id',
          'type': '@type',
          'sec': 'https://w3id.org/security#',
          'xsd': 'http://www.w3.org/2001/XMLSchema#',
          'challenge': 'sec:challenge',
          'created': {
            '@id': 'http://purl.org/dc/terms/created',
            '@type': 'xsd:dateTime',
          },
          'domain': 'sec:domain',
          'expires': {
            '@id': 'sec:expiration',
            '@type': 'xsd:dateTime',
          },
          'jws': 'sec:jws',
          'nonce': 'sec:nonce',
          'proofPurpose': {
            '@id': 'sec:proofPurpose',
            '@type': '@vocab',
            '@context': {
              '@version': 1.1,
              '@protected': true,
              'id': '@id',
              'type': '@type',
              'sec': 'https://w3id.org/security#',
              'assertionMethod': {
                '@id': 'sec:assertionMethod',
                '@type': '@id',
                '@container': '@set',
              },
              'authentication': {
                '@id': 'sec:authenticationMethod',
                '@type': '@id',
                '@container': '@set',
              },
            },
          },
          'proofValue': 'sec:proofValue',
          'verificationMethod': {
            '@id': 'sec:verificationMethod',
            '@type': '@id',
          },
        },
      },
      'Ed25519Signature2018': {
        '@id': 'https://w3id.org/security#Ed25519Signature2018',
        '@context': {
          '@version': 1.1,
          '@protected': true,
          'id': '@id',
          'type': '@type',
          'sec': 'https://w3id.org/security#',
          'xsd': 'http://www.w3.org/2001/XMLSchema#',
          'challenge': 'sec:challenge',
          'created': {
            '@id': 'http://purl.org/dc/terms/created',
            '@type': 'xsd:dateTime',
          },
          'domain': 'sec:domain',
          'expires': {
            '@id': 'sec:expiration',
            '@type': 'xsd:dateTime',
          },
          'jws': 'sec:jws',
          'nonce': 'sec:nonce',
          'proofPurpose': {
            '@id': 'sec:proofPurpose',
            '@type': '@vocab',
            '@context': {
              '@version': 1.1,
              '@protected': true,
              'id': '@id',
              'type': '@type',
              'sec': 'https://w3id.org/security#',
              'assertionMethod': {
                '@id': 'sec:assertionMethod',
                '@type': '@id',
                '@container': '@set',
              },
              'authentication': {
                '@id': 'sec:authenticationMethod',
                '@type': '@id',
                '@container': '@set',
              },
            },
          },
          'proofValue': 'sec:proofValue',
          'verificationMethod': {
            '@id': 'sec:verificationMethod',
            '@type': '@id',
          },
        },
      },
      'RsaSignature2018': {
        '@id': 'https://w3id.org/security#RsaSignature2018',
        '@context': {
          '@version': 1.1,
          '@protected': true,
          'challenge': 'sec:challenge',
          'created': {
            '@id': 'http://purl.org/dc/terms/created',
            '@type': 'xsd:dateTime',
          },
          'domain': 'sec:domain',
          'expires': {
            '@id': 'sec:expiration',
            '@type': 'xsd:dateTime',
          },
          'jws': 'sec:jws',
          'nonce': 'sec:nonce',
          'proofPurpose': {
            '@id': 'sec:proofPurpose',
            '@type': '@vocab',
            '@context': {
              '@version': 1.1,
              '@protected': true,
              'id': '@id',
              'type': '@type',
              'sec': 'https://w3id.org/security#',
              'assertionMethod': {
                '@id': 'sec:assertionMethod',
                '@type': '@id',
                '@container': '@set',
              },
              'authentication': {
                '@id': 'sec:authenticationMethod',
                '@type': '@id',
                '@container': '@set',
              },
            },
          },
          'proofValue': 'sec:proofValue',
          'verificationMethod': {
            '@id': 'sec:verificationMethod',
            '@type': '@id',
          },
        },
      },
      'proof': {
        '@id': 'https://w3id.org/security#proof',
        '@type': '@id',
        '@container': '@graph',
      },
    },
  },
  documentUrl: 'https://www.w3.org/2018/credentials/v1',
  tag: 'static',
}
const y = {
  document: {
    '@context': {
      'id': '@id',
      'type': '@type',
      '@protected': true,
      'proof': {
        '@id': 'https://w3id.org/security#proof',
        '@type': '@id',
        '@container': '@graph',
      },
      'Ed25519VerificationKey2020': {
        '@id': 'https://w3id.org/security#Ed25519VerificationKey2020',
        '@context': {
          '@protected': true,
          'id': '@id',
          'type': '@type',
          'controller': {
            '@id': 'https://w3id.org/security#controller',
            '@type': '@id',
          },
          'revoked': {
            '@id': 'https://w3id.org/security#revoked',
            '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
          },
          'publicKeyMultibase': {
            '@id': 'https://w3id.org/security#publicKeyMultibase',
            '@type': 'https://w3id.org/security#multibase',
          },
        },
      },
      'Ed25519Signature2020': {
        '@id': 'https://w3id.org/security#Ed25519Signature2020',
        '@context': {
          '@protected': true,
          'id': '@id',
          'type': '@type',
          'challenge': 'https://w3id.org/security#challenge',
          'created': {
            '@id': 'http://purl.org/dc/terms/created',
            '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
          },
          'domain': 'https://w3id.org/security#domain',
          'expires': {
            '@id': 'https://w3id.org/security#expiration',
            '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
          },
          'nonce': 'https://w3id.org/security#nonce',
          'proofPurpose': {
            '@id': 'https://w3id.org/security#proofPurpose',
            '@type': '@vocab',
            '@context': {
              '@protected': true,
              'id': '@id',
              'type': '@type',
              'assertionMethod': {
                '@id': 'https://w3id.org/security#assertionMethod',
                '@type': '@id',
                '@container': '@set',
              },
              'authentication': {
                '@id': 'https://w3id.org/security#authenticationMethod',
                '@type': '@id',
                '@container': '@set',
              },
              'capabilityInvocation': {
                '@id': 'https://w3id.org/security#capabilityInvocationMethod',
                '@type': '@id',
                '@container': '@set',
              },
              'capabilityDelegation': {
                '@id': 'https://w3id.org/security#capabilityDelegationMethod',
                '@type': '@id',
                '@container': '@set',
              },
              'keyAgreement': {
                '@id': 'https://w3id.org/security#keyAgreementMethod',
                '@type': '@id',
                '@container': '@set',
              },
            },
          },
          'proofValue': {
            '@id': 'https://w3id.org/security#proofValue',
            '@type': 'https://w3id.org/security#multibase',
          },
          'verificationMethod': {
            '@id': 'https://w3id.org/security#verificationMethod',
            '@type': '@id',
          },
        },
      },
    },
  },
  documentUrl: 'https://w3id.org/security/suites/ed25519-2020/v1',
  tag: 'static',
}
const z = {
  document: {
    '@context': {
      '@vocab': 'https://www.w3.org/ns/activitystreams#',
      'type': '@type',
      'id': '@id',
      'actor': 'https://www.w3.org/ns/activitystreams#actor',
      'name': 'https://www.w3.org/ns/activitystreams#name',
      'email': 'https://www.w3.org/ns/activitystreams#email',
      'url': 'https://www.w3.org/ns/activitystreams#url',
      'object': 'https://www.w3.org/ns/activitystreams#object',
      'summary': 'https://www.w3.org/ns/activitystreams#summary',
      'attachment': 'https://www.w3.org/ns/activitystreams#attachment',
      'mediaType': 'https://www.w3.org/ns/activitystreams#mediaType',
      'target': 'https://www.w3.org/ns/activitystreams#target',
      'startTime': 'https://www.w3.org/ns/activitystreams#startTime',
      'endTime': 'https://www.w3.org/ns/activitystreams#endTime',
      'tag': 'https://www.w3.org/ns/activitystreams#tag',
      'published': 'https://www.w3.org/ns/activitystreams#published',
      'location': 'https://www.w3.org/ns/activitystreams#location',
    },
  },
  documentUrl: 'https://www.w3.org/ns/activitystreams',
  tag: 'static',
}

export function documentLoader(url: string) {
  switch (url) {
    case 'https://www.w3.org/ns/credentials/v2':
      // todo для v2 проставлять другой тип
      return x
    case 'https://www.w3.org/2018/credentials/v1':
      return x
    case 'https://w3id.org/security/suites/ed25519-2020/v1':
      return y
    case 'https://www.w3.org/ns/activitystreams':
      return z
    case 'did:gic:demo': {
      console.warn('WIP testing')
      return x
    }
    default: {
      alert('Unknown url: ' + url)
      throw new Error('Unknown type url: ' + url)
    }
  }
}
