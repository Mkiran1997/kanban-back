import { algoliaIndex } from './client';

export async function configureIndex() {
  try {
    await algoliaIndex.setSettings({
      searchableAttributes: [ 'description'],
      customRanking: ['desc(popularity)'],
    });
    console.log('Algolia index configured successfully');
  } catch (error) {
    console.error('Error configuring Algolia index:', error);
  }
}
