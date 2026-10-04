#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
==============================================================================
낙동강 발전관리과 교대근무 포털 - Antigravity 웹 서버 (Python)
==============================================================================
사용법:
    python server.py
    또는
    python server.py --port 8080
"""

import sys
import os
import argparse
import socket
import socketserver
from http.server import SimpleHTTPRequestHandler
import webbrowser

def get_lan_ips():
    ips = []
    try:
        hostname = socket.gethostname()
        for ip in socket.gethostbyname_ex(hostname)[2]:
            if not ip.startswith('127.'):
                ips.append(ip)
    except Exception:
        pass
    if not ips:
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ips.append(s.getsockname()[0])
            s.close()
        except Exception:
            pass
    return ips

# 파이썬 내장 antigravity 모듈 임포트
try:
    import antigravity
    print("[Antigravity] Python antigravity module loaded successfully! 🚀")
except ImportError:
    pass

import json

def load_env_config():
    config = {
        "url": os.environ.get("SUPABASE_URL", ""),
        "anonKey": os.environ.get("SUPABASE_ANON_KEY", "")
    }
    web_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(web_dir, "..", ".env"),
        os.path.join(web_dir, ".env")
    ]
    for env_path in candidates:
        if os.path.isfile(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip("'\"")
                            if k == "SUPABASE_URL" and not config["url"]:
                                config["url"] = v
                            elif k == "SUPABASE_ANON_KEY" and not config["anonKey"]:
                                config["anonKey"] = v
            except Exception:
                pass
    return config

class AntigravityHTTPHandler(SimpleHTTPRequestHandler):
    """
    UTF-8 인코딩 및 CORS 헤더를 지원하는 전용 HTTP 핸들러
    """
    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_POST(self):
        if self.path.split("?")[0] == "/api/water-proxy":
            content_length = int(self.headers.get('Content-Length', 0))
            post_body = self.rfile.read(content_length)
            try:
                import urllib.request
                import urllib.parse
                try:
                    params = urllib.parse.parse_qs(post_body.decode('utf-8'))
                    flat_params = {k: v[0] for k, v in params.items()}
                    if 'mode' not in flat_params:
                        flat_params['mode'] = 'getHydr'
                    if 'param1' not in flat_params:
                        flat_params['param1'] = 'M'
                    post_body = urllib.parse.urlencode(flat_params).encode('utf-8')
                except Exception:
                    pass
                req = urllib.request.Request(
                    "https://www.water.or.kr/kor/realtime/sumun/ajaxProc.do",
                    data=post_body,
                    headers={
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                        "Referer": "https://www.water.or.kr/kor/realtime/sumun/index.do?mode=sumun&menuId=13_91_93_94"
                    }
                )
                with urllib.request.urlopen(req, timeout=8) as response:
                    data = response.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.send_header("Content-Length", str(len(data)))
                    self.end_headers()
                    self.wfile.write(data)
                    return
            except Exception as e:
                err_payload = json.dumps({"error": True, "message": str(e), "list": []}).encode("utf-8")
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(err_payload)))
                self.end_headers()
                self.wfile.write(err_payload)
                return

        return super().do_GET()

    def do_GET(self):
        if self.path.split("?")[0] == "/api/water-proxy":
            query = self.path.split("?")[1] if "?" in self.path else "mode=getHydr&param1=M"
            try:
                import urllib.request
                req = urllib.request.Request(
                    "https://www.water.or.kr/kor/realtime/sumun/ajaxProc.do",
                    data=query.encode("utf-8"),
                    headers={
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                        "Referer": "https://www.water.or.kr/kor/realtime/sumun/index.do?mode=sumun&menuId=13_91_93_94"
                    }
                )
                with urllib.request.urlopen(req, timeout=8) as response:
                    data = response.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.send_header("Content-Length", str(len(data)))
                    self.end_headers()
                    self.wfile.write(data)
                    return
            except Exception as e:
                err_payload = json.dumps({"error": True, "message": str(e), "list": []}).encode("utf-8")
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(err_payload)))
                self.end_headers()
                self.wfile.write(err_payload)
                return

        if self.path.split("?")[0] in ["/api/download-apk", "/download-apk", "/app-debug.apk", "/download/app-debug.apk", "/NakdongShift.apk", "/NakdongShift_v1.0.apk", "/download/NakdongShift_v1.0.apk"]:
            web_dir = os.path.dirname(os.path.abspath(__file__))
            candidates = [
                os.path.join(web_dir, "NakdongShift_v1.0.apk"),
                os.path.join(web_dir, "download", "NakdongShift_v1.0.apk"),
                os.path.join(web_dir, "app-debug.apk"),
                os.path.join(web_dir, "download", "app-debug.apk"),
                os.path.join(web_dir, "..", "NakdongShift_v1.0.apk"),
                os.path.join(web_dir, "..", "app-debug.apk"),
                os.path.join(web_dir, "..", "app", "build", "outputs", "apk", "debug", "app-debug.apk")
            ]
            for p in candidates:
                if os.path.isfile(p):
                    self.send_response(200)
                    self.send_header("Content-Type", "application/vnd.android.package-archive")
                    self.send_header("Content-Disposition", 'attachment; filename="NakdongShift_v1.0.apk"')
                    self.send_header("Content-Length", str(os.path.getsize(p)))
                    self.end_headers()
                    with open(p, "rb") as f:
                        import shutil
                        shutil.copyfileobj(f, self.wfile)
                    return
            self.send_response(302)
            self.send_header("Location", "/NakdongShift_v1.0.apk")
            self.end_headers()
            return

        if self.path.split("?")[0] == "/api/config":
            cfg = load_env_config()
            payload = json.dumps(cfg).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        return super().do_GET()
    def end_headers(self):
        # CORS 허용 및 캐시 제어 헤더 추가
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, apikey, Authorization')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def guess_type(self, path):
        # MIME 타입 보정 (UTF-8 인코딩 명시)
        if path.endswith('.apk'):
            return "application/vnd.android.package-archive"
        ctype = super().guess_type(path)
        if ctype.startswith('text/') or ctype in ['application/javascript', 'application/json']:
            return f"{ctype}; charset=utf-8"
        return ctype

    def log_message(self, format, *args):
        # 컬러풀한 콘솔 로그 출력
        sys.stderr.write(f"\033[94m[Web Server]\033[0m {self.address_string()} - {format % args}\n")

def run_server(port=3000, open_browser=True):
    # 스크립트가 위치한 디렉터리를 서빙 루트로 설정
    web_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(web_dir)

    server_address = ('', port)
    
    # 포트 재사용 허용
    socketserver.TCPServer.allow_reuse_address = True

    with socketserver.TCPServer(server_address, AntigravityHTTPHandler) as httpd:
        url = f"http://localhost:{port}"
        lan_ips = get_lan_ips()
        print("=" * 70)
        print("🌊 낙동강 발전관리과 4조3교대 근무포털 웹서버가 가동되었습니다!")
        print(f"💻 내 PC 접속 주소 : \033[92m\033[1m{url}\033[0m")
        if lan_ips:
            print(f"📱 다른 사용자 공유 : \033[96m\033[1mhttp://{lan_ips[0]}:{port}\033[0m (동일 와이파이/사내망)")
            for extra_ip in lan_ips[1:]:
                print(f"                    \033[96mhttp://{extra_ip}:{port}\033[0m")
        else:
            print(f"📱 다른 사용자 공유 : 사내 IP를 확인하여 http://[PC_IP]:{port} 로 접속하세요.")
        print(f"📂 서빙 경로 : {web_dir}")
        print("⚙️  기능 구성 : 개인캘린더, 팀일정표, 대교직 승인, 업무메모, 게시판, Supabase")
        print(f"🌐 외부 인터넷 공유 : npx localtunnel --port {port} (어디서나 접속 가능)")
        print("🚀 무중력 모드: 상단 'Antigravity 모드' 버튼 클릭 시 부유 효과 작동")
        print("🛑 서버 종료 : Ctrl + C")
        print("=" * 70)

        if open_browser:
            try:
                webbrowser.open(url)
            except Exception:
                pass

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[Antigravity] 웹서버가 정상적으로 종료되었습니다.")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="낙동강 발전관리과 Antigravity 웹서버")
    parser.add_argument('-p', '--port', type=int, default=3000, help="웹서버 포트 번호 (기본값: 3000)")
    parser.add_argument('--no-browser', action='store_true', help="브라우저 자동 열기 비활성화")
    args = parser.parse_args()

    run_server(port=args.port, open_browser=not args.no_browser)
