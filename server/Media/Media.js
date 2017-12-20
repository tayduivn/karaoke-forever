const db = require('sqlite')
const squel = require('squel')
const debug = require('debug')
const log = debug('app:media')

class Media {
/**
 * Get media list as quickly as possible (single query) for
 * pushing to clients. Only includes one media item per song (the
 * preferred item, if one is set) and does not include providerData
 *
 * @return {Promise} Object with artist and media results
 */
  static async getMedia () {
    try {
      const q = squel.select()
        .field('media.mediaId, media.title, media.duration, media.artistId')
        .field('artists.name AS artist')
        .field('MAX(media.isPreferred) AS isPreferred')
        .field('COUNT(*) AS numMedia')
        .field('COUNT(stars.userId) AS numStars')
        .from('media')
        .join(squel.select()
          .from('providers')
          .where('providers.isEnabled = 1')
          .order('priority'),
        'providers', 'media.provider = providers.name')
        .join('artists USING (artistId)')
        .left_join('stars USING(mediaId)')
        .group('artistId')
        .group('title')
        .order('artists.name')
        .order('media.title')

      const { text, values } = q.toParam()
      return await db.all(text, values)
    } catch (err) {
      return Promise.reject(err)
    }
  }

  /**
   * Get media items matching all search criteria
   *
   * @param  {object}  fields Search criteria
   * @return {Promise}        Object with media results
   */
  static async searchMedia (fields) {
    const media = {
      result: [],
      entities: {}
    }

    const q = squel.select()
      .field('media.*')
      .from('media')
      .join(squel.select()
        .from('providers')
        .where('providers.isEnabled = 1')
        .order('priority'),
      'providers', 'media.provider = providers.name')

    // filters
    Object.keys(fields).map(key => {
      if (key === 'providerData') {
        Object.keys(fields.providerData).map(pKey => {
          const val = fields.providerData[pKey]

          // handle arrays (do nothing if val is an empty array)
          if (Array.isArray(val) && val.length) {
            q.where(`json_extract(providerData, '$.${pKey}') IN ?`, val)
          } else if (!Array.isArray(val)) {
            q.where(`json_extract(providerData, '$.${pKey}') = ?`, val)
          }
        })
      } else {
        q.where(`${key} = ?`, fields[key])
      }
    })

    try {
      const { text, values } = q.toParam()
      const res = await db.all(text, values)

      for (const row of res) {
        media.result.push(row.mediaId)
        row.providerData = JSON.parse(row.providerData)
        media.entities[row.mediaId] = row
      }
    } catch (err) {
      return Promise.reject(err)
    }

    return media
  }

  /**
   * Add media item to the library, matching or adding artist
   *
   * @param  {object}  media Media item
   * @return {Promise}       Newly added item's mediaId (number)
   */
  static async add (media) {
    if (!media.artist || !media.title || !media.duration || !media.provider) {
      return Promise.reject(new Error('Invalid media data: ' + JSON.stringify(media)))
    }

    // does the artist already exist?
    let row

    try {
      const q = squel.select()
        .from('artists')
        .where('name = ?', media.artist)

      const { text, values } = q.toParam()
      row = await db.get(text, values)
    } catch (err) {
      return Promise.reject(err)
    }

    if (row) {
      log('matched artist: %s', row.name)
      media.artistId = row.artistId
    } else {
      log('new artist: %s', media.artist)

      try {
        const q = squel.insert()
          .into('artists')
          .set('name', media.artist)

        const { text, values } = q.toParam()
        const res = await db.run(text, values)

        if (!Number.isInteger(res.stmt.lastID)) {
          throw new Error('invalid lastID after artist insert')
        }

        media.artistId = res.stmt.lastID
      } catch (err) {
        return Promise.reject(err)
      }
    }

    // prep for insert; we have the artistId now
    delete media.artist
    media.duration = Math.round(media.duration)
    media.providerData = JSON.stringify(media.providerData || {})

    try {
      const q = squel.insert()
        .into('media')

      Object.keys(media).forEach(key => {
        q.set(key, media[key])
      })

      const { text, values } = q.toParam()
      const res = await db.run(text, values)

      if (!Number.isInteger(res.stmt.lastID)) {
        throw new Error('got invalid lastID after song insert')
      }

      // return mediaId
      return Promise.resolve(res.stmt.lastID)
    } catch (err) {
      log(err)
      return Promise.reject(err)
    }
  }

  /**
   * Removes mediaIds in sqlite-friendly batches
   *
   * @param  {array}  mediaIds
   * @return {Promise}
   */
  static async remove (mediaIds) {
    const batchSize = 999

    while (mediaIds.length) {
      const q = squel.delete()
        .from('media')
        .where('mediaId IN ?', mediaIds.splice(0, batchSize))

      try {
        const { text, values } = q.toParam()
        await db.run(text, values)
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}

module.exports = Media
