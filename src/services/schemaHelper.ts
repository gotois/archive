import {Contract, FormatContract} from 'components/models'

export function formatterContracts(contracts: Array<Contract>): Array<FormatContract> {
  return contracts.map((contract: Contract) => ({
    '@context': 'https://schema.org',
    '@type': 'OrganizeAction',
    'agent': {
      '@type': 'Person',
      'name': contract.agent_name
    },
    'participant': {
      '@type': 'Person',
      'name': contract.participant_name
    },
    instrument: {
      '@type': 'Thing',
      'name': contract.instrument_name,
      'description': contract.instrument_description
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
