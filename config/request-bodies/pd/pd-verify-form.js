/**
 * Form data configuration for the PD verify endpoint
 * This file contains all the required fields for the multipart form request
 * Based on parameters from Bruno collection
 */

module.exports = {
  formData: {
    // Bounding box coordinates
    bbox_1: '0',
    bbox_2: '0',
    bbox_3: '351.97286530700285',
    bbox_4: '351.97286530700285',
    
    // Eye coordinates
    leye_x: '280.21245798700113',
    leye_y: '258.0869313957214',
    reye_x: '282.9441265042033',
    reye_y: '117.32428843566765',
    eye_left_open: 'true',
    eye_right_open: 'true',
    
    // Timestamp
    captured_time: 'Thu, 04 Jun 2020 10:38:53 GMT',
    
    // Camera properties
    efl: '2.87',
    hor_fov: '64.1641',
    ver_fov: '64.1641',
    
    // Device orientation
    pitch: '92.402686662614',
    yaw: '106.712310663485',
    roll: '-103.096231157475',
    displayOrientation: '270',
    
    // Image properties
    light: '0',
    lenses: 'both',
    reduced_resolution_x: '1280',
    reduced_resolution_y: '720',
    full_resolution_x: '1280',
    full_resolution_y: '720',
    crop_origin_x: '78.6175301376278',
    crop_origin_y: '447.58012596658284',
    bottomCropHeight: '0',
    camera_max_resolution_width: '3088',
    camera_max_resolution_height: '2320',
    aspect_ratio_cam_max_resolution: '1',
    compress: '0.95',
    isFocusOnMarkers: 'true',
    
    // Device information
    phone_model: 'SM-A530F',
    software_version: '8.1',
    version: '2.6.3',
    
    // Tracking and session data
    events: '{}',
    image_id: '385afac6-fac5-47ff-9d54-0088160faf13',
    executed_actions: '',
    current_action_id: '',
    count_action_id: '',
    targets_valid: '',
    
    // Browser information
    browserAppVersion: '',
    browserName: '',
    browserVersion: '',
    is_desktop: ''
  },
  fileParams: {
    image: {
      path: 'config/test-assets/pd.jpeg',
      type: 'image/jpeg'
    }
  }
}; 