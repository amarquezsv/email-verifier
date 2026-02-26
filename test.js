import http from 'k6/http';
import { check } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 10 }
    ],
    thresholds: { http_req_duration: ['avg<100', 'p(95)<200'] },
};

export default function () {
    const url = 'http://localhost:8081/request-registration';
    const payload = JSON.stringify({
        "email": "test.amarquez@example.com"
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res = http.post(url, payload, params);
    check(res, {
        'is status 204': (r) => r.status === 204,
    });
}