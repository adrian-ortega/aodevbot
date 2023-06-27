const client = require('./client');
exports.getUser = async (id) => {
  try {
    const params = { first: 1 };
    console.log({
      isNan: isNaN(id),
      id
    })
    if (isNaN(id)) {
      params.login = id;
    } else {
      params.id = id;
    }

    const { data: responseData } = await client.get('/helix/users', { params });
    const { data } = responseData;
    return data.length > 0 ? data[0] : null;
  } catch (err) {
    console.log('Something went wrong', err);
    return null;
  }
}