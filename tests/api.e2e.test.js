const assert = require('assert');

const API_BASE = 'http://localhost:8888';

async function runTest() {
    console.log('Running E2E API Test...');
    
    // 1. Fetch videos to get a valid ID
    console.log(`Fetching videos from ${API_BASE}/api/videos`);
    const getResponse = await fetch(`${API_BASE}/api/videos`);
    assert.strictEqual(getResponse.status, 200, 'Should be able to fetch videos');
    const videos = await getResponse.json();
    assert.ok(videos.length > 0, 'Should have at least one video to test with');
    
    const videoToUpdate = videos[0];
    const updateId = videoToUpdate.id;

    // 2. The tags object we will send
    const payload = {
        song_name: 'E2E Test Song',
        venue: 'E2E Test Venue',
        type: 'acoustic',
        partial: true
    };

    console.log(`Sending PUT request to update video ID ${updateId} with payload:`, payload);

    // 3. Perform the PUT request
    const putResponse = await fetch(`${API_BASE}/api/videos/${updateId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    assert.strictEqual(putResponse.status, 200, 'PUT request should succeed');
    const data = await putResponse.json();

    assert.ok(data.video, 'Response should contain the updated video object');

    console.log('Received updated video from API:', data.video);

    // 4. Verify the API returns EXACTLY the same tags
    const returnedTags = {
        song_name: data.video.song_name,
        venue: data.video.venue,
        type: data.video.type,
        partial: data.video.partial
    };

    try {
        assert.deepStrictEqual(returnedTags, payload, 'The returned tags should exactly match the payload sent');
        console.log('✅ TEST PASSED: The returned object matches exactly what was sent.');
    } catch (error) {
        console.error('❌ TEST FAILED: The returned object does NOT match exactly what was sent.');
        console.error('Expected:', payload);
        console.error('Actual:', returnedTags);
        process.exitCode = 1;
    }
}

runTest().catch(err => {
    console.error('Test encountered an unexpected error:', err);
    process.exitCode = 1;
});
