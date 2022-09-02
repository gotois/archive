import {Contract, FormatContract} from '../types/models'

export function formatterContracts(contracts: Contract[]): FormatContract[] {
  return contracts.map((contract: Contract) => ({
    '@context': 'https://schema.org',
    '@type': 'OrganizeAction',
    'agent': {
      '@type': 'Person',
      'name': contract.agent_name,
    },
    'participant': {
      '@type': 'Person',
      'name': contract.participant_name,
    },
    'instrument': {
      '@type': 'Thing',
      'name': contract.instrument_name,
      'description': contract.instrument_description,
    },
    'identifier': {
      '@type': 'PropertyValue',
      'propertyID': 'Database ID',
      'value':  String(contract.id),
    },
    'startTime': contract.startTime,
    'endTime': contract.endTime,
    'object': contract.images.map((image) => ({
      '@type': 'ImageObject',
      'contentUrl': image,
    })),
    _currentSlide: 1,
  }))
}
